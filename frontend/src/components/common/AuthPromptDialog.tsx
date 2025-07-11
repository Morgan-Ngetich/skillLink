import {
  Button,
  Dialog,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { useNavigateWithRedirect } from "@/hooks/auth/authState";
import { storage } from "@/utils/localstorage";

const AuthPromptDialog = () => {
  const { user, isLoading } = useAuth();
  const [open, setOpen] = useState(false);

  const navigateWithRedirect = useNavigateWithRedirect();
  // Show dialog only once loading is complete and user is unauthenticated
  useEffect(() => {
    if (!user && !isLoading && !storage.get("authPromptDismissed")) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [user, isLoading]);

  if (user || isLoading) return null; // Don’t show if logged in or loading

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)} size="sm" placement="center" motionPreset="slide-in-top">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content border="1px solid" textAlign={'center'}>
            <Dialog.Header>
              <Dialog.Title w={'full'}>
                <Text fontSize={'2xl'} textAlign={'center'}>
                  Thanks for visiting MENTspace
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
                    setOpen(false);
                  }}
                  borderRadius={"lg"}>
                  Log in
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigateWithRedirect("/signup");
                    setOpen(false);
                  }}
                  border="1px solid"
                  borderRadius={"lg"}
                >
                  Sign up for free
                </Button>

                <Text
                  fontSize="sm"
                  mt={5}
                  textAlign="center"
                  textUnderlineOffset={5}
                  textDecoration="underline"
                  cursor="pointer"
                  transition="color 0.2s ease"
                  _hover={{
                    textDecoration: 'underline',
                  }}
                  onClick={() => {
                    storage.set("authPromptDismissed", "true");
                    setOpen(false);
                  }}

                >
                  Stay logged out
                </Text>
              </VStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default AuthPromptDialog;
