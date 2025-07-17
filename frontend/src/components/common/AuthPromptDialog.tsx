import {
  Button,
  Dialog,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useLocation } from "@tanstack/react-router";
import { useNavigateWithRedirect } from "@/hooks/auth/authState";
import { setPromptDismissed } from "@/utils/authPromptDismiss";

interface AuthPromptDialogProps {
  open: boolean;
  showStayLoggedOut: boolean;
  onClose: () => void;
}

const AuthPromptDialog: React.FC<AuthPromptDialogProps> = ({ open, showStayLoggedOut, onClose }) => {
  const navigateWithRedirect = useNavigateWithRedirect();
  const location = useLocation();

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) onClose();
      }}
      size="sm"
      placement="center"
      motionPreset="slide-in-left"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content border="1px solid" textAlign="center">
            <Dialog.Header>
              <Dialog.Title w="full">
                <Text fontSize="2xl" textAlign="center">
                  Enjoy MENTspace your way
                </Text>
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <Text fontSize="sm">
                Log in or sign up for the full experience — <br />or continue as a guest.
              </Text>
            </Dialog.Body>

            <Dialog.Footer>
              <VStack w="full" align="stretch" gap={3}>
                <Button
                  onClick={() => {
                    navigateWithRedirect("/login");
                    onClose();
                  }}
                  borderRadius="lg"
                >
                  Log in
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigateWithRedirect("/signup");
                    onClose();
                  }}
                  border="1px solid"
                  borderRadius="lg"
                >
                  Sign up for free
                </Button>

                {/* Show "Stay logged out" only if allowed */}
                {showStayLoggedOut ? (
                  <Text
                    fontSize="sm"
                    mt={5}
                    textAlign="center"
                    textDecoration="underline"
                    textUnderlineOffset={5}
                    cursor="pointer"
                    transition="color 0.2s ease"
                    _hover={{ textDecoration: "underline" }}
                    onClick={() => {
                      setPromptDismissed(location.pathname);
                      onClose();
                    }}
                  >
                    Stay logged out
                  </Text>
                ) : (
                  <Button
                    variant="outline"
                    size={'sm'}
                    onClick={() => {
                      window.history.back(); // fallback: go back to last page
                      onClose();
                    }}
                  >
                    ← Go back
                  </Button>
                )}
              </VStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default AuthPromptDialog;
