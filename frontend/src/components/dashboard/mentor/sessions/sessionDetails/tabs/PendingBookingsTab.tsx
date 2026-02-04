import { VStack, Box, HStack, Text, Badge, Button } from "@chakra-ui/react";
import { Avatar } from "@/components/ui";
import { LuCheck, LuX } from "react-icons/lu";
import type { BookingPublic } from "@/client";
import { useState } from "react";

interface PendingBookingsTabProps {
  bookings: BookingPublic[];
  onConfirm: (bookingId: number) => void;
  onDeny: (bookingId: number) => void;
  isConfirming: boolean;
  isDenying: boolean;
}

const PendingBookingsTab = ({
  bookings,
  onConfirm,
  onDeny,
  // isConfirming,
  // isDenying,
}: PendingBookingsTabProps) => {
  // Track which booking is being processed
  const [processingBookingId, setProcessingBookingId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'confirm' | 'deny' | null>(null);

  const handleConfirm = async (bookingId: number) => {
    setProcessingBookingId(bookingId);
    setActionType('confirm');

    try {
      await onConfirm(bookingId);
    } catch (error: unknown) {
      // Restore on error
      console.error("Error confirming booking:", error);
    } finally {
      setProcessingBookingId(null);
      setActionType(null);
    }
  };

  const handleDeny = async (bookingId: number) => {
    setProcessingBookingId(bookingId);
    setActionType('deny');
    await onDeny(bookingId);
    // Reset after action completes
    setProcessingBookingId(null);
    setActionType(null);
  };

  return (
    <VStack align="stretch" gap={3} pb={4}>
      <HStack justify="space-between" mb={2}>
        <Text fontSize="sm" color="fg.muted">
          {bookings.length} pending {bookings.length === 1 ? "request" : "requests"}
        </Text>
        <Badge colorPalette="orange" size="sm">
          Awaiting Response
        </Badge>
      </HStack>

      {bookings.length > 0 ? (
        bookings.map((booking) => {
          const isProcessingThis = processingBookingId === booking.id;
          const isConfirmingThis = isProcessingThis && actionType === 'confirm';
          const isDenyingThis = isProcessingThis && actionType === 'deny';

          return (
            <HStack
              key={booking.id}
              justify={"space-between"}
              p={3}
              bg="cardbg"
              rounded="lg"
              transition="all 0.2s"
            >
              <HStack align="start" gap={3}>
                <Avatar
                  size={{ base: "md", md: "lg" }}
                  src={booking.mentee?.avatar_url ?? "/fallback.jpg"}
                  name={booking.mentee?.full_name || `Participant ${booking.id}`}
                />
                <Box flex="1">
                  <Text fontWeight="semibold" fontSize={{ base: "sm", md: "md" }}>
                    {booking.mentee?.full_name || "Anonymous"}
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    {booking.mentee?.email || "Mentee"}
                  </Text>
                  {booking.message && (
                    <Box
                      mt={2}
                      p={2}
                      bg="bg.muted"
                      rounded="md"
                      borderLeft="3px solid"
                      borderColor="colorPalette.subtle"
                    >
                      <Text fontSize="sm" color="fg.muted">
                        "{booking.message}"
                      </Text>
                    </Box>
                  )}
                </Box>
              </HStack>

              <HStack gap={2} justify="end" mt={3}>
                <Button
                  size="xs"
                  variant="outline"
                  colorPalette="red"
                  onClick={() => handleDeny(booking.id)}
                  loading={isDenyingThis}
                  disabled={isProcessingThis}
                >
                  <LuX />
                  Deny
                </Button>
                <Button
                  size="xs"
                  colorPalette="green"
                  onClick={() => handleConfirm(booking.id)}
                  loading={isConfirmingThis}
                  disabled={isProcessingThis}
                >
                  <LuCheck />
                  Confirm
                </Button>
              </HStack>
            </HStack>
          );
        })
      ) : (
        <Box py={12} textAlign="center">
          <Text color="fg.muted" fontSize={{ base: "sm", md: "md" }}>
            No pending booking requests
          </Text>
          <Text color="fg.subtle" fontSize="xs" mt={2}>
            All bookings have been reviewed
          </Text>
        </Box>
      )}
    </VStack>
  );
};

export default PendingBookingsTab;