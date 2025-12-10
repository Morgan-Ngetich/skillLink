import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from "@chakra-ui/react";
import { activeToasts } from "@/hooks/public/useToaster";

export const toaster = createToaster({
  placement: "bottom-end",
  pauseOnPageIdle: true,
});

// NOTE: No dismissing toast on handleClose. Chakra handles dismiss internally via <Toast.CloseTrigger> automatically.
export const Toaster = () => {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: "4" }}>
        {(toast) => {
          const handleClose = () => {
            if (toast.id) activeToasts.delete(toast.id);
          };

          return (
            <Toast.Root width={{ md: "sm" }}>
              {toast.type === "loading" ? (
                <Spinner size="sm" color="blue.solid" />
              ) : (
                <Toast.Indicator />
              )}
              <Stack gap="1" flex="1" maxWidth="100%">
                {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
                {toast.description && (
                  <Toast.Description>{toast.description}</Toast.Description>
                )}
              </Stack>
              {toast.action && (
                <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
              )}
              <Toast.CloseTrigger onClick={handleClose} />
            </Toast.Root>
          );
        }}
      </ChakraToaster>
    </Portal>
  );
};
