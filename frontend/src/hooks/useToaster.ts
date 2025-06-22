import { useCallback } from "react";
import { toaster } from "../components/ui/toaster";

type ToastStatus = "success" | "error" | "info" | "warning" | "loading";

const useToaster = () => {
  const showToast = useCallback(
    (title: string, description: string, status: ToastStatus = "info") => {
      toaster.create({
        title,
        description,
        type: status,
        closable: true,
      });
    },
    [],
  );

  return showToast;
};

export default useToaster;
