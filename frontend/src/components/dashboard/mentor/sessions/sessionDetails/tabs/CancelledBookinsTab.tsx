import { VStack, Box, HStack, Text, Badge, IconButton, Menu, Icon } from "@chakra-ui/react";
import { Avatar } from "@/components/ui";
import type { BookingPublic } from "@/client";
import { formatDistanceToNow } from "date-fns";
import { FaX } from "react-icons/fa6";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaRedoAlt } from "react-icons/fa";
import { LuMail } from "react-icons/lu";
import { useState } from "react";

interface CancelledBookingsTabProps {
  bookings: BookingPublic[];
  sessionTitle?: string;
  isOwner?: boolean;
  onConfirm?: (bookingId: number) => void;
  isConfirming: boolean;
}

const CancelledBookingsTab = ({
  bookings,
  sessionTitle,
  isOwner,
  onConfirm,
  isConfirming
}: CancelledBookingsTabProps) => {
  // Track which booking is being cancelled
  const [confirmingBookingId, setConfirmingBookingId] = useState<number | null>(null);

  const handleConfirm = async (bookingId: number) => {
    if (!onConfirm) return;

    setConfirmingBookingId(bookingId);
    await onConfirm(bookingId);
    setConfirmingBookingId(null);
  };

  return (
    <VStack align="stretch" gap={0}>
      <Text fontSize="sm" color="fg.muted" mb={2}>
        {bookings.length} cancelled {bookings.length === 1 ? "booking" : "bookings"}
      </Text>

      {bookings.length > 0 ? (
        bookings.map((booking) => {
          const cancelledBy = booking.status === "cancelled_by_mentor"
            ? "Cancelled by you"
            : "Cancelled by participant";

          const cancelledWhen = booking.updated_at
            ? formatDistanceToNow(new Date(booking.updated_at), { addSuffix: true })
            : "";

          const isConfirmingThis = confirmingBookingId === booking.id;

          return (
            <Box
              key={booking.id}
              p={3}
              bgGradient="to-b"
              gradientFrom={"bg.subtle"}
              gradientTo={"cardbg"}
              borderBottom={"1px solid"}
              rounded="lg"
              borderColor="border.emphasized"
              transition="all 0.2s"
            >
              <HStack justify="space-between" align="start">
                <HStack gap={3} flex={1}>
                  <Avatar
                    size={{ base: "sm", md: "md" }}
                    src={booking.mentee?.avatar_url ?? "/fallback.jpg"}
                    name={booking.mentee?.full_name || `Participant ${booking.id}`}
                    opacity={0.7}
                  />
                  <Box flex={1}>
                    <Text fontWeight="semibold" fontSize={{ base: "sm", md: "md" }} color={"fg.muted"}>
                      {booking.mentee?.full_name || "Anonymous"}
                    </Text>
                    <Text fontSize="xs" color="fg.subtle">
                      {cancelledBy} {cancelledWhen}
                    </Text>
                  </Box>
                </HStack>

                <HStack gap={2} justify="end">
                  <Badge colorPalette="red" size={{ base: "sm", md: "md" }} variant="subtle">
                    <FaX />
                    Cancelled
                  </Badge>

                  {isOwner && onConfirm && (
                    <Menu.Root positioning={{ placement: "bottom-end" }}>
                      <Menu.Trigger asChild>
                        <IconButton
                          size="xs"
                          variant="ghost"
                          aria-label="More options"
                          disabled={isConfirming}
                        >
                          <BsThreeDotsVertical />
                        </IconButton>
                      </Menu.Trigger>

                      <Menu.Positioner>
                        <Menu.Content minW="180px">
                          {/* Message mentee (optional feature) */}
                          <Menu.Item
                            value="message"
                            _hover={{
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              // Open default mail client with pre-filled email to the mentee this mentor cancelled
                              const email = booking.mentee?.email;
                              const subject = encodeURIComponent(`Regarding your booking for "${sessionTitle || "the session"}"`);
                              const body = encodeURIComponent(
                                `Hi ${booking.mentee?.full_name || "there"},\n\n` +
                                `I wanted to reach out regarding your booking for "${sessionTitle || "the session"}". ` +
                                `If you have any questions or would like to discuss rebooking, please feel free to reply to this email.\n\n` +
                                `Best regards,\n` +
                                `Your Mentor`
                              );

                              if (email) {
                                window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
                              }
                            }}

                          >
                            <LuMail />
                            Message Participant
                          </Menu.Item>

                          <Menu.Separator />

                          <Menu.Item
                            value="confirm"
                            color="green.500"
                            onClick={() => handleConfirm(booking.id)}
                            disabled={isConfirmingThis}
                            _hover={{
                              cursor: "pointer",
                            }}
                          >
                            <Icon rotate="280deg">
                              <FaRedoAlt />
                            </Icon>
                            {isConfirming ? "Confirming..." : "Accept Participant"}
                          </Menu.Item>

                          <Menu.Arrow />
                        </Menu.Content>
                      </Menu.Positioner>
                    </Menu.Root>
                  )}
                </HStack>

              </HStack>
            </Box>
          );
        })
      ) : (
        <Box py={12} textAlign="center">
          <Text color="fg.muted" fontSize={{ base: "sm", md: "md" }}>
            No cancelled bookings
          </Text>
        </Box>
      )}
    </VStack>
  );
};

export default CancelledBookingsTab;