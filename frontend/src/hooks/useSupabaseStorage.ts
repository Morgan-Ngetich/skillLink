import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabaseClient";
import useToaster from "../hooks/useToaster";
import { getApiErrorMessage } from "@/utils/errorUtils";

// ==================== TYPES ====================
type BucketType = "avatars" | "mentor-services" | "mentor-profiles" | "session-images";

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

    case "session-images":
      if (!ss) throw new Error("sessionUuid required");
      return `${u}/session_${ss}_${timestamp}.${ext}`;

    case "avatars":
      return `${u}/avatar_${timestamp}.${ext}`;

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
      qc.invalidateQueries({ queryKey: ["mentor-services"] });
      if (resourceId) qc.invalidateQueries({ queryKey: ["mentor-service", resourceId] });
      break;
    case "session-images":
      qc.invalidateQueries({ queryKey: ["mentor-sessions"] });
      break;
    case "avatars":
      qc.invalidateQueries({ queryKey: ["current-user"] });
      break;
    case "mentor-profiles":
      qc.invalidateQueries({ queryKey: ["mentor-profile", userUuid] });
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

export type { BucketType, UploadOptions, UploadResult, DeleteOptions };
