import {
  Button,
  Dialog,
  Portal,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useLocation } from '@tanstack/react-router';
import { useNavigateWithRedirect } from '@/hooks/auth/authState';
import { setPromptDismissed } from '@/utils/authPromptDismiss';
import { useAuthPromptStore } from '@/hooks/store/useAuthPromptStore';

interface AuthPromptDialogProps {
  open: boolean;
  showStayLoggedOut: boolean;
  onClose: () => void;
}

const AuthPromptDialog: React.FC<AuthPromptDialogProps> = ({
  open,
  showStayLoggedOut,
  onClose,
}) => {
  const navigateWithRedirect = useNavigateWithRedirect();
  const location = useLocation();
  const { setDismissedThisSession } = useAuthPromptStore();

  const handleLogin = () => {
    navigateWithRedirect('/login');
    onClose();
  };

  const handleSignup = () => {
    navigateWithRedirect('/signup');
    onClose();
  };

  const handleStayLoggedOut = () => {
    // Set permanent dismissal for this path
    setPromptDismissed(location.pathname);
    // Also set session dismissal
    setDismissedThisSession(true);
    onClose();
  };

  const handleGoBack = () => {
    window.history.back();
    onClose();
  };

  // Prevent closing on backdrop click for protected routes
  const handleOpenChange = (details: { open: boolean }) => {
    if (!details.open && !showStayLoggedOut) {
      // Protected route - don't allow dismissal
      return;
    }
    if (!details.open) {
      onClose();
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={handleOpenChange}
      size="sm"
      placement="center"
      motionPreset="slide-in-left"
      closeOnInteractOutside={showStayLoggedOut} // Only allow backdrop close for non-protected routes
      closeOnEscape={showStayLoggedOut} // Only allow ESC close for non-protected routes
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content border="1px solid" textAlign="center">
            <Dialog.Header>
              <Dialog.Title w="full">
                <Text fontSize="2xl" textAlign="center">
                  {showStayLoggedOut
                    ? 'Enjoy MENTspace your way'
                    : 'Authentication Required'}
                </Text>
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <Text fontSize="sm" color="fg.muted">
                {showStayLoggedOut ? (
                  <>
                    Log in or sign up for the full experience — <br />
                    or continue as a guest.
                  </>
                ) : (
                  'This page requires authentication. Please log in or sign up to continue.'
                )}
              </Text>
            </Dialog.Body>

            <Dialog.Footer>
              <VStack w="full" align="stretch" gap={3}>
                <Button onClick={handleLogin} borderRadius="lg">
                  Log in
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignup}
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
                    _hover={{ textDecoration: 'underline' }}
                    onClick={handleStayLoggedOut}
                  >
                    Stay logged out
                  </Text>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleGoBack}>
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