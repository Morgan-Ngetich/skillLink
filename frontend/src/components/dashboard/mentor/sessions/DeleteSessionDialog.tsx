import { Text, Button } from "@chakra-ui/react";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MentorSessionPublic } from "@/client";

interface DeleteSessionDialogProps {
  isOpen: boolean;
  session: MentorSessionPublic | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteSessionDialog = ({ isOpen, session, onClose, onConfirm }: DeleteSessionDialogProps) => {
  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && onClose()} role="alertdialog" placement="center">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Session</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text>
            Are you sure you want to cancel{" "}
            <Text as="span" fontWeight="bold">
              "{session?.title}"
            </Text>
            ? This action cannot be undone.
          </Text>
          <Text mt={2} fontSize="xs" color="fg.muted">
            The session will be marked as cancelled. You will still see it in your history, but mentees won't be able
            to book it.
          </Text>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline" onClick={onClose}>
              Keep
            </Button>
          </DialogActionTrigger>
          <Button colorPalette="red" onClick={onConfirm}>
            Cancel Session
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default DeleteSessionDialog;