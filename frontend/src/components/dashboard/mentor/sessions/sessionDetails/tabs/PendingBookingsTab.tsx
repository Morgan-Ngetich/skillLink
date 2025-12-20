import { VStack, Box, HStack, Text, Badge, Button } from "@chakra-ui/react";
import { Avatar } from "@/components/ui";
import { LuCheck, LuX } from "react-icons/lu";
import type { BookingPublic } from "@/client";

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
  isConfirming,
  isDenying,
}: PendingBookingsTabProps) => {
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
        bookings.map((booking) => (
          <Box
            key={booking.id}
            p={4}
            bg="bg.subtle"
            rounded="lg"
            borderWidth="1px"
            borderColor="orange.subtle"
            transition="all 0.2s"
          >
            <HStack align="start" gap={3} mb={3}>
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

            <HStack gap={2} justify="end">
              <Button
                size="sm"
                variant="outline"
                colorPalette="red"
                onClick={() => onDeny(booking.id)}
                loading={isDenying}
              >
                <LuX />
                Deny
              </Button>
              <Button
                size="sm"
                colorPalette="green"
                onClick={() => onConfirm(booking.id)}
                loading={isConfirming}
              >
                <LuCheck />
                Confirm
              </Button>
            </HStack>
          </Box>
        ))
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
