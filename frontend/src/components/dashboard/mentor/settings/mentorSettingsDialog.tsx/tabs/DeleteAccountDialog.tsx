import { useState } from "react";
import { Button, HStack, Input, Text, VStack, Icon } from "@chakra-ui/react";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { LuTriangleAlert } from "react-icons/lu";
import { useAuth } from "@/hooks/auth/useAuth";

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteAccountDialog = ({ isOpen, onClose }: DeleteAccountDialogProps) => {
  const [confirmText, setConfirmText] = useState("");
  const { user, deleteUserMe } = useAuth();

  const CONFIRM_KEYWORD = user?.full_name
  const isConfirmed = confirmText === CONFIRM_KEYWORD;

  const handleDelete = () => {
    if (!isConfirmed) return;
    deleteUserMe.mutate();
  };

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && handleClose()} size="sm">
      <DialogContent>
        <DialogHeader>
          <HStack color="red.500">
            <Icon>
              <LuTriangleAlert />
            </Icon>
            <DialogTitle color="red.500">Delete Account</DialogTitle>
          </HStack>
        </DialogHeader>

        <DialogBody>
          <VStack align="start" gap={4}>
            <Text fontSize="sm" color="fg.muted">
              This action is <strong>permanent and irreversible</strong>. Your profile,
              sessions, and all associated data will be deleted immediately.
            </Text>
            <Text fontSize="sm">
              Type <strong>{CONFIRM_KEYWORD}</strong> to confirm:
            </Text>
            <Input
              placeholder={CONFIRM_KEYWORD}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              borderColor={isConfirmed ? "red.500" : undefined}
            />
          </VStack>
        </DialogBody>

        <DialogFooter borderTopWidth="1px" borderColor="border.muted">
          <HStack justify="space-between" w="full">
            <Button variant="subtle" onClick={handleClose} size="sm">
              Cancel
            </Button>
            <Button
              colorPalette="red"
              onClick={handleDelete}
              disabled={!isConfirmed}
              loading={deleteUserMe.isPending}
              size="sm"
            >
              Permanently Delete Account
            </Button>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default DeleteAccountDialog;