import { useCallback } from "react";
import { toaster } from "@/components/ui/toaster";

type ToastStatus = "success" | "error" | "info" | "warning" | "loading";

export type ToastOptions = {
  title: string;
  description?: string;
  status?: ToastStatus;
  id?: string; // Optional ID to deduplicate or update
};

// Expose for Toaster component to clean up
export const activeToasts = new Set<string>();

const useToaster = () => {
  const showToast = useCallback(
    ({ title, description = "", status = "info", id }: ToastOptions) => {
      if (id && activeToasts.has(id)) {
        toaster.update(id, {
          title,
          description,
          type: status,
        });
      } else {
        toaster.create({
          id,
          title,
          description,
          type: status,
          closable: true,
        });
        if (id) activeToasts.add(id);
      }
    },
    []
  );

  return showToast;
};

export default useToaster;
