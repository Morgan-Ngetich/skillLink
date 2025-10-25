import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabaseClient";
import useToaster from "../hooks/useToaster";
import { getApiErrorMessage } from "@/utils/errorUtils";

type BucketType =
  | "avatars"
  | "mentor-services"
  | "mentor-profiles"
  | "session-images";

interface UploadOptions {
  userUuid: string;
  serviceUuid?: string;
  sessionUuid?: string;
}

interface UploadResult {
  path: string;
  url: string;
}

// Core Upload Logic (non-hook utility)
async function supabaseUploadFile(
  bucket: BucketType,
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  if (!options.userUuid) throw new Error("userUuid is required for all uploads");

  const ext = file.name.split(".").pop() || file.type.split("/")[1] || "jpg";
  const timestamp = Date.now();
  let filePath = "";

  switch (bucket) {
    case "avatars": {
      const randomSuffix = crypto.randomUUID().slice(0, 8);
      filePath = `${options.userUuid}/avatar_${randomSuffix}.${ext}`;
      break;
    }
    case "mentor-services": {
      if (!options.serviceUuid)
        throw new Error("serviceUuid is required for mentor-services");
      filePath = `${options.userUuid}/service_${options.serviceUuid}_${timestamp}.${ext}`;
      break;
    }
    case "mentor-profiles": {
      filePath = `${options.userUuid}/cover_${timestamp}.${ext}`;
      break;
    }
    case "session-images": {
      if (!options.sessionUuid)
        throw new Error("sessionUuid is required for session-images");
      filePath = `${options.userUuid}/session_${options.sessionUuid}_${timestamp}.${ext}`;
      break;
    }
    default:
      throw new Error(`Unsupported bucket: ${bucket}`);
  }

  // Auto-detect & delete previous files
  const { data: existingFiles, error: listError } = await supabase.storage
    .from(bucket)
    .list(options.userUuid + "/", { limit: 50 });

  if (!listError && existingFiles?.length) {
    const filesToDelete = existingFiles.map((f) => `${options.userUuid}/${f.name}`);
    const { error: deleteError } = await supabase.storage
      .from(bucket)
      .remove(filesToDelete);
    if (deleteError) console.warn("Could not delete old files:", deleteError.message);
  }

  // Upload new file
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return {
    path: filePath,
    url: publicData.publicUrl,
  };
}

// Delete Logic
async function supabaseDeleteFile(bucket: BucketType, path: string) {
  if (!path) throw new Error("No file path provided");
  const { error: deleteError } = await supabase.storage.from(bucket).remove([path]);
  if (deleteError) throw new Error(deleteError.message);
  return true;
}

export function useSupabaseStorage() {
  const toast = useToaster();
  const queryClient = useQueryClient();

  // Upload File Mutation
  const uploadMutation = useMutation<
    UploadResult,
    Error,
    { bucket: BucketType; file: File; options: UploadOptions }
  >({
    mutationFn: ({ bucket, file, options }) => supabaseUploadFile(bucket, file, options),
    onSuccess: (_, variables) => {
      toast({
        id: "upload-success",
        title: "Upload successful",
        status: "success",
      });
      // Invalidate cache related to this bucket/user
      queryClient.invalidateQueries({
        queryKey: ["storage", variables.bucket, variables.options.userUuid],
      });
    },
    onError: (error) => {
      toast({
        id: "upload-error",
        title: "Upload failed",
        description: getApiErrorMessage(error),
        status: "error",
      });
    },
  });

  // Delete File Mutation
  const deleteMutation = useMutation<
    boolean,
    Error,
    { bucket: BucketType; path: string }
  >({
    mutationFn: ({ bucket, path }) => supabaseDeleteFile(bucket, path),
    onSuccess: (_, variables) => {
      toast({
        id: "delete-success",
        title: "File deleted",
        status: "info",
      });
      queryClient.invalidateQueries({
        queryKey: ["storage", variables.bucket],
      });
    },
    onError: (error) => {
      toast({
        id: "delete-error",
        title: "Failed to delete file",
        description: getApiErrorMessage(error),
        status: "error",
      });
    },
  });

  // Utility — get public URL
  function getPublicUrl(bucket: BucketType, path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  return {
    uploadFile: uploadMutation.mutate,
    uploadFileAsync: uploadMutation.mutateAsync, // Promise-based for chaining
    deleteFile: deleteMutation.mutate,
    deleteFileAsync: deleteMutation.mutateAsync,
    getPublicUrl,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

