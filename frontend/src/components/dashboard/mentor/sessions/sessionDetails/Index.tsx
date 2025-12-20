import { useState } from "react";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogCloseTrigger,
} from "@/components/ui/dialog";
import { Tabs, Stack, Button, HStack, Text, Badge } from "@chakra-ui/react";
import { LuUser, LuUsers, LuBookOpen, LuClock } from "react-icons/lu";
import type { MentorSessionPublic } from "@/client";
import { useMentorBookings } from "@/hooks/mentor/useMentorBookings";
import { useUserById } from "@/hooks/public/useProfile";
import { useAuth } from "@/hooks/auth/useAuth";
import { useAuthPromptStore } from "@/hooks/store/useAuthPromptStore";
import { useNavigateWithRedirect } from "@/hooks/auth/authState";

import SessionDetailsTab from "./tabs/SessionDetailsTab";
import ParticipantsTab from "./tabs/ParticipantsTab";
import PreparationTab from "./tabs/PreparationTab";
import PendingBookingsTab from "./tabs/PendingBookingsTab";

interface SessionDetailModalProps {
  session: MentorSessionPublic | null;
  isOpen: boolean;
  onClose: () => void;
}

const SessionDetailModal = ({ session, isOpen, onClose }: SessionDetailModalProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const { setOpen } = useAuthPromptStore();
  const navigateWithRedirect = useNavigateWithRedirect();

  const {
    bookSessionAsync,
    confirmBooking,
    denyBooking,
    isBooking,
    isConfirming,
    isDenying,
  } = useMentorBookings();

  const { data: userData } = useUserById(session?.mentor_id || 0);

  if (!session) return null;

  const isOwner = user?.is_mentor && session.mentor_id === user.id;
  const isFull = session.is_full;
  const requiresMessage = userData?.profile?.mentor_profile?.settings?.require_intro_message;

  const sessionPendingBookings = (session.bookings || []).filter((b) => b.status === "pending");
  const sessionConfirmedBookings = (session.bookings || []).filter((b) => b.status === "confirmed");

  const handleBook = async () => {
    try {
      if (!user) {
        setOpen(true);
        return;
      }

      if (!user.profile?.is_profile_setup_complete) {
        const currentSearchParams = new URLSearchParams(window.location.search);
        currentSearchParams.set('sessionDetailId', session.uuid);
        const redirectUrl = `${window.location.pathname}?${currentSearchParams.toString()}`;
        navigateWithRedirect("/profile-setup", redirectUrl);
        return;
      }

      await bookSessionAsync({
        sessionId: session.id,
        data: { message: message.trim() || undefined },
      });
      onClose();
      setMessage("");
    } catch (error) {
      console.error("Booking failed:", error);
    }
  };

  const handleConfirmBooking = async (bookingId: number) => {
    await confirmBooking(bookingId, {
      onSuccess: () => console.log("Booking confirmed successfully"),
    });
  };

  const handleDenyBooking = async (bookingId: number) => {
    await denyBooking(bookingId, "Denied by mentor")
  };

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(e) => !e.open && onClose()}
      size={{ base: "full", md: "lg" }}
      placement="center"
    >
      <DialogContent
        border="1px solid"
        borderColor="border.emphasized"
        minH={{ base: "100vh", md: "xl" }}
        maxH={{ base: "100vh", md: "90vh" }}
        overflow="hidden"
        display="flex"
        flexDirection="column"
        borderRadius="md"
      >
        <DialogHeader pb={3}>
          <DialogTitle fontSize={{ base: "lg", md: "xl" }}>Session Details</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        <DialogBody flex="1" overflow="auto" px={{ base: 4, md: 6 }}>
          <Tabs.Root defaultValue="details">
            <Tabs.List mb={4}>
              <Tabs.Trigger value="details" fontSize={{ base: "sm", md: "md" }}>
                <HStack gap={1.5}>
                  <LuUser aria-hidden="true" />
                  <Text>Details</Text>
                </HStack>
              </Tabs.Trigger>
              
              <Tabs.Trigger value="participants" fontSize={{ base: "sm", md: "md" }}>
                <HStack gap={1.5}>
                  <LuUsers aria-hidden="true" />
                  <Text>Participants</Text>
                  <Text>({sessionConfirmedBookings.length})</Text>
                </HStack>
              </Tabs.Trigger>

              {isOwner && sessionPendingBookings.length > 0 && (
                <Tabs.Trigger value="pending" fontSize={{ base: "sm", md: "md" }}>
                  <HStack gap={1.5}>
                    <LuClock aria-hidden="true" />
                    <Text>Pending</Text>
                    <Badge colorPalette="orange" size="sm">
                      {sessionPendingBookings.length}
                    </Badge>
                  </HStack>
                </Tabs.Trigger>
              )}

              {session.preparation_materials && session.preparation_materials.length > 0 && (
                <Tabs.Trigger value="prep" fontSize={{ base: "sm", md: "md" }}>
                  <HStack gap={1.5}>
                    <LuBookOpen aria-hidden="true" />
                    <Text>Prep</Text>
                  </HStack>
                </Tabs.Trigger>
              )}
              <Tabs.Indicator />
            </Tabs.List>

            <Tabs.Content value="details">
              <SessionDetailsTab
                session={session}
                userData={userData}
                isOwner={!!isOwner}
                isFull={isFull}
                requiresMessage={requiresMessage}
                message={message}
                setMessage={setMessage}
              />
            </Tabs.Content>

            {isOwner && (
              <Tabs.Content value="pending">
                <PendingBookingsTab
                  bookings={sessionPendingBookings}
                  onConfirm={handleConfirmBooking}
                  onDeny={handleDenyBooking}
                  isConfirming={isConfirming}
                  isDenying={isDenying}
                />
              </Tabs.Content>
            )}

            <Tabs.Content value="participants">
              <ParticipantsTab
                bookings={sessionConfirmedBookings}
                isOwner={!!isOwner}
              />
            </Tabs.Content>

            {session.preparation_materials && session.preparation_materials.length > 0 && (
              <Tabs.Content value="prep">
                <PreparationTab materials={session.preparation_materials} />
              </Tabs.Content>
            )}
          </Tabs.Root>
        </DialogBody>

        <DialogFooter pt={4} borderTopWidth="1px" borderColor="border.muted">
          <Stack
            direction={{ base: "column", sm: "row" }}
            justify="space-between"
            w="full"
            gap={3}
          >
            <Button
              variant="outline"
              onClick={onClose}
              w={{ base: "full", sm: "auto" }}
              order={{ base: 2, sm: 1 }}
            >
              {isOwner ? "Close" : "Cancel"}
            </Button>
            {!isOwner && (
              <Button
                colorPalette="green"
                onClick={handleBook}
                loading={isBooking}
                disabled={isFull || (requiresMessage && !message.trim())}
                w={{ base: "full", sm: "auto" }}
                order={{ base: 1, sm: 2 }}
              >
                {isFull ? "Session Full" : "Book Session"}
              </Button>
            )}
          </Stack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default SessionDetailModal;