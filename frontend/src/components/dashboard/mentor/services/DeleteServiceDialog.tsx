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
import type { MentorServicePublic } from "@/client";

interface DeleteServiceDialogProps {
  isOpen: boolean;
  service: MentorServicePublic | null;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteServiceDialog = ({ isOpen, service, onClose, onConfirm }: DeleteServiceDialogProps) => {
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
              "{service?.title}"
            </Text>
            ? This action cannot be undone.
          </Text>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline" onClick={onClose}>
              Keep
            </Button>
          </DialogActionTrigger>
          <Button colorPalette="red" onClick={onConfirm}>
            Delte service
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default DeleteServiceDialog;