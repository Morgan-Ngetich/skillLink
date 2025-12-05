import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabaseClient";
import useToaster from "../public/useToaster";
import { getApiErrorMessage } from "@/utils/errorUtils";
import { useAuth } from "../auth/useAuth";
import { useRef, useState } from "react";

// ==================== TYPES ====================
type BucketType = "avatars" | "covers" | "mentor-services" | "mentor-profiles" | "mentor_sessions";

interface UploadOptions {
  userUuid: string;
  serviceUuid?: string;
  sessionUuid?: string;
  oldFilePath?: string;
  onProgress?: (progress: number) => void;
}

interface UploadResult {
  path: string;
  url: string;
  bucket: BucketType;
  timestamp: number;
}

interface DeleteOptions {
  bucket: BucketType;
  path: string;
  userUuid?: string;
}

type ImageType = "avatar" | "cover";

interface UseProfileImageUploadOptions {
  type: ImageType;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

// ==================== UTILITIES ====================
const sanitize = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, "");
const getExt = (file: File) => file.type?.split("/")[1]?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "jpg";

// Always safe paths — no hyphens, uppercase, or symbols
const buildPath = (
  bucket: BucketType,
  opts: UploadOptions,
  ext: string,
  timestamp: number
) => {
  const u = sanitize(opts.userUuid);
  const s = opts.serviceUuid ? sanitize(opts.serviceUuid) : "";
  const ss = opts.sessionUuid ? sanitize(opts.sessionUuid) : "";

  switch (bucket) {
    case "mentor-services":
      if (!s) throw new Error("serviceUuid required");
      return `${u}/service_${s}_${timestamp}.${ext}`;

    case "mentor_sessions":
      if (!ss) throw new Error("sessionUuid required");
      return `${u}/session_${ss}_${timestamp}.${ext}`;

    case "avatars":
      return `${u}/avatar_${timestamp}.${ext}`;

    case "covers":
      return `${u}/cover_${timestamp}.${ext}`;

    case "mentor-profiles":
      return `${u}/cover_${timestamp}.${ext}`;

    default:
      throw new Error("Unsupported bucket");
  }
};

const encodeStoragePath = (p: string) => encodeURI(p);

// ==================== CORE ====================
async function supabaseUploadFile(
  bucket: BucketType,
  file: File,
  opts: UploadOptions
): Promise<UploadResult> {
  if (!opts.userUuid) throw new Error("userUuid is required");

  const timestamp = Date.now();
  const ext = getExt(file);
  const filePath = buildPath(bucket, opts, ext, timestamp);

  // Safe delete old file
  if (opts.oldFilePath) {
    try {
      await supabase.storage.from(bucket).remove([opts.oldFilePath]);
    } catch (e) {
      console.warn("Old file cleanup failed:", e);
    }
  }

  const upload = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type || "image/png",
      cacheControl: "3600",
    });

  if (upload.error) throw upload.error;

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(encodeStoragePath(filePath));

  return {
    path: filePath,
    url: data.publicUrl ?? "",
    bucket,
    timestamp,
  };
}

async function supabaseDeleteFile(bucket: BucketType, path: string) {
  if (!path) throw new Error("Missing storage path");
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
  return true;
}

function getPublicUrl(bucket: BucketType, path: string) {
  if (!path) return "";
  const encoded = encodeStoragePath(path);
  const { data } = supabase.storage.from(bucket).getPublicUrl(encoded);
  return data.publicUrl ?? "";
}

// ==================== CACHE ====================
function invalidateQueries(
  qc: ReturnType<typeof useQueryClient>,
  bucket: BucketType,
  userUuid: string,
  resourceId?: string
) {
  qc.invalidateQueries({ queryKey: ["storage", bucket, userUuid] });

  switch (bucket) {
    case "mentor-services":
      qc.invalidateQueries({ queryKey: ["mentorServices"] });
      if (resourceId) qc.invalidateQueries({ queryKey: ["mentor-service", resourceId] });
      break;
    case "mentor_sessions":
      qc.invalidateQueries({ queryKey: ["mentorSessions"] });
      break;
    case "avatars":
      qc.invalidateQueries({ queryKey: ["auth", "user"] });
      break;
    case "covers":
      qc.invalidateQueries({ queryKey: ["auth", "user"] });
      break;
    case "mentor-profiles":
      qc.invalidateQueries({ queryKey: ["mentorProfile", "me", userUuid] });
      break;
  }
}

// ==================== HOOK ====================
export function useSupabaseStorage() {
  const toast = useToaster();
  const qc = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: ({ bucket, file, options }: { bucket: BucketType; file: File; options: UploadOptions }) =>
      supabaseUploadFile(bucket, file, options),

    onSuccess: (_, v) => {
      const id = v.options.serviceUuid || v.options.sessionUuid;
      invalidateQueries(qc, v.bucket, v.options.userUuid, id);
      toast({ id: "upload-success", title: "Uploaded!", status: "success" });
    },

    onError: (e: unknown) =>
      toast({
        id: "upload-error",
        title: "Upload failed",
        description: getApiErrorMessage(e),
        status: "error",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ bucket, path }: DeleteOptions) => supabaseDeleteFile(bucket, path),
    onSuccess: (_, v) => {
      toast({ id: "delete-success", title: "File deleted", status: "info" });
      if (v.userUuid) invalidateQueries(qc, v.bucket, v.userUuid);
    },
  });

  return {
    uploadFile: uploadMutation.mutate,
    uploadFileAsync: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    deleteFile: deleteMutation.mutate,
    deleteFileAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    getPublicUrl,
  };
}





// Profile iamge upload hook
export function useProfileImageUpload({ type, onSuccess, onError }: UseProfileImageUploadOptions) {
  const { user, updateCurrentAuthUser } = useAuth();
  const toast = useToaster();
  const { uploadFile, isUploading } = useSupabaseStorage();
  
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isProcessing = isUploading || updateCurrentAuthUser.isPending;

  // Bucket mapping
  const bucketMap: Record<ImageType, BucketType> = {
    avatar: 'avatars',
    cover: 'covers',
  };

  // Field mapping for user update
  const fieldMap: Record<ImageType, 'avatar_url' | 'cover_image'> = {
    avatar: 'avatar_url',
    cover: 'cover_image',
  };

  // Labels for user feedback
  const labelMap: Record<ImageType, string> = {
    avatar: 'avatar',
    cover: 'cover image',
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!file.type.startsWith('image/')) {
      return {
        valid: false,
        error: 'Please upload an image file',
      };
    }

    if (file.size > 5 * 1024 * 1024) {
      return {
        valid: false,
        error: 'Please upload an image smaller than 5MB',
      };
    }

    return { valid: true };
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.uuid) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      toast({
        id: `invalid-${type}`,
        title: 'Invalid file',
        description: validation.error,
        status: 'error',
      });
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to S3
    try {
      const result = await new Promise<{ url: string }>((resolve, reject) => {
        uploadFile(
          {
            bucket: bucketMap[type],
            file: file,
            options: {
              userUuid: user.uuid,
            },
          },
          {
            onSuccess: (data) => resolve(data as { url: string }),
            onError: reject,
          }
        );
      });

      // Update user profile with new image URL
      const updateField = fieldMap[type];
      updateCurrentAuthUser.mutate(
        {
          [updateField]: result.url,
        },
        {
          onSuccess: () => {
            setPreview(null);
            toast({
              id: `${type}-success`,
              title: `${labelMap[type].charAt(0).toUpperCase() + labelMap[type].slice(1)} updated`,
              description: `Your ${labelMap[type]} has been updated successfully`,
              status: 'success',
            });
            onSuccess?.();
          },
          onError: (error) => {
            console.error(`Failed to update ${type}:`, error);
            setPreview(null);
            toast({
              id: `update-${type}-error`,
              title: `Failed to update ${labelMap[type]}`,
              description: `The image was uploaded but failed to save to your profile`,
              status: 'error',
            });
            onError?.(error as Error);
          },
        }
      );
    } catch (error) {
      console.error(`${type} upload failed:`, error);
      toast({
        id: `upload-${type}-error`,
        title: `Failed to upload ${labelMap[type]}`,
        description: 'Please try again',
        status: 'error',
      });
      setPreview(null);
      onError?.(error as Error);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return {
    preview,
    fileInputRef,
    isProcessing,
    handleFileChange,
    triggerFileInput,
  };
}

export type { BucketType, UploadOptions, UploadResult, DeleteOptions, ImageType, UseProfileImageUploadOptions };
