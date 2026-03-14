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
import { Tabs, Stack, Button, HStack, Text, Badge, Box } from "@chakra-ui/react";
import { LuUser, LuUsers, LuBookOpen, LuClock, LuCircleX } from "react-icons/lu";
import type { MentorSessionPublic } from "@/client";
import { useMentorBookings } from "@/hooks/mentor/useMentorBookings";
import { useUserById } from "@/hooks/public/useProfile";
import { useAuth } from "@/hooks/auth/useAuth";
import { useNavigateWithRedirect } from "@/hooks/auth/authState";

import SessionDetailsTab from "./tabs/SessionDetailsTab";
import ParticipantsTab from "./tabs/ParticipantsTab";
import PreparationTab from "./tabs/PreparationTab";
import PendingBookingsTab from "./tabs/PendingBookingsTab";
import SessionDetailSkeleton from "@/skeletons/SessionDetailSkeleton";
import CancelledBookingsTab from "./tabs/CancelledBookinsTab";

interface SessionDetailModalProps {
  session: MentorSessionPublic | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

const SessionDetailModal = ({ session, isOpen, onClose, isLoading }: SessionDetailModalProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const navigateWithRedirect = useNavigateWithRedirect();

  const {
    bookSessionAsync,
    confirmBooking,
    denyBooking,
    isBooking,
    isConfirming,
    isDenying,
  } = useMentorBookings();

  // Only fetch userData if we have a session
  const { data: userData } = useUserById(
    session?.mentor_id || 0,
    !!session?.mentor_id // Pass boolean directly as second parameter
  );
  // Don't render modal at all if not open or if no session and not loading
  if (!session && !isLoading) return null;

  const isOwner = session ? user?.is_mentor && session.mentor_id === user.id : false;
  const isFull = session?.is_full ?? false;
  const isUserBooked = session?.user_has_booked ?? false
  const requiresMessage = userData?.profile?.mentor_profile?.settings?.require_intro_message;

  const sessionPendingBookings = session ? (session.bookings || []).filter((b) => b.status === "pending") : [];
  const sessionConfirmedBookings = session ? (session.bookings || []).filter((b) => b.status === "confirmed") : [];
  const sessionCancelledBookings = session
    ? (session.bookings || []).filter((b) =>
      b.status === "cancelled_by_mentor" ||
      b.status === "cancelled_by_mentee"
    )
    : [];

  const handleBook = async () => {
    if (!session) return;

    const currentSearchParams = new URLSearchParams(window.location.search);
    const redirectUrl = `${window.location.pathname}?${currentSearchParams.toString()}`;
    try {
      if (!user) {
        console.log("redirect url", redirectUrl)
        navigateWithRedirect("/login", redirectUrl);
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

  console.log("isOwner", isOwner)
  console.log("isUserBooked", isUserBooked)

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

        <DialogBody flex="1" px={{ base: 4, md: 6 }}>
          {isLoading || !session ? (
            <SessionDetailSkeleton />
          ) : (
            <Tabs.Root defaultValue="details">
              <Box overflowX="auto" whiteSpace="nowrap" mb={4}>
                <Tabs.List w="max-content" minW="100%">
                  <Tabs.Trigger value="details" fontSize={{ base: "sm", md: "md" }}>
                    <HStack gap={1.5}>
                      <LuUser aria-hidden="true" />
                      <Text>Details</Text>
                    </HStack>
                  </Tabs.Trigger>

                  {session.preparation_materials && session.preparation_materials.length > 0 && (
                    <Tabs.Trigger value="prep" fontSize={{ base: "sm", md: "md" }}>
                      <HStack gap={1.5}>
                        <LuBookOpen aria-hidden="true" />
                        <Text>Prep</Text>
                      </HStack>
                    </Tabs.Trigger>
                  )}

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

                  {isOwner && sessionCancelledBookings.length > 0 && (
                    <Tabs.Trigger value="cancelled">
                      <HStack gap={1.5}>
                        <LuCircleX />
                        <Text>Cancelled</Text>
                        <Badge colorPalette="red" size="sm" variant="subtle">
                          {sessionCancelledBookings.length}
                        </Badge>
                      </HStack>
                    </Tabs.Trigger>
                  )}

                  <Tabs.Indicator />
                </Tabs.List>
              </Box>

              <Tabs.Content value="details" overflowY="auto" maxH="calc(90vh - 220px)">
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

              {session.preparation_materials && session.preparation_materials.length > 0 && (
                <Tabs.Content value="prep" overflowY="auto" maxH="calc(90vh - 220px)">
                  <PreparationTab materials={session.preparation_materials} />
                </Tabs.Content>
              )}

              {isOwner && (
                <Tabs.Content value="pending" overflowY="auto" maxH="calc(90vh - 220px)">
                  <PendingBookingsTab
                    bookings={sessionPendingBookings}
                    onConfirm={handleConfirmBooking}
                    onDeny={handleDenyBooking}
                    isConfirming={isConfirming}
                    isDenying={isDenying}
                  />
                </Tabs.Content>
              )}

              <Tabs.Content value="participants" overflowY="auto" maxH="calc(90vh - 220px)">
                <ParticipantsTab
                  bookings={sessionConfirmedBookings}
                  sessionTitle={session.title}
                  isOwner={!!isOwner}
                  onCancelBooking={isOwner ? handleDenyBooking : undefined}
                />
              </Tabs.Content>

              {isOwner && (
                <Tabs.Content value="cancelled" overflowY="auto" maxH="calc(90vh - 220px)">
                  <CancelledBookingsTab
                    bookings={sessionCancelledBookings}
                    sessionTitle={session.title}
                    isOwner={!!isOwner}
                    onConfirm={handleConfirmBooking}
                    isConfirming={isConfirming}
                  />
                </Tabs.Content>
              )}
            </Tabs.Root>
          )}
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
              {isOwner || isUserBooked ? "Close" : "Cancel"}
            </Button>
            {!isOwner && !isLoading && (
              <Button
                colorPalette="green"
                onClick={handleBook}
                loading={isBooking}
                disabled={isFull || isUserBooked || (requiresMessage && !message.trim())}
                w={{ base: "full", sm: "auto" }}
                order={{ base: 1, sm: 2 }}
              >
                {isUserBooked ? "Booked" : isFull ? "Session Full" : "Book Session"}
              </Button>
            )}
          </Stack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default SessionDetailModal;