import { VStack, Box, HStack, Text, Badge } from "@chakra-ui/react";
import { Avatar } from "@/components/ui";
import type { BookingPublic } from "@/client";

interface ParticipantsTabProps {
  bookings: BookingPublic[];
  isOwner: boolean;
}

const ParticipantsTab = ({ bookings, isOwner }: ParticipantsTabProps) => {
  return (
    <VStack align="stretch" gap={3} pb={4}>
      <Text fontSize="sm" color="fg.muted" mb={2}>
        {bookings.length} confirmed {bookings.length === 1 ? "participant" : "participants"}
      </Text>

      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <Box
            key={booking.id}
            p={3}
            bg="cardbg"
            _hover={{ bg: "bg.muted" }}
            rounded="lg"
            borderWidth="1px"
            borderColor="border.muted"
            transition="all 0.2s"
          >
            <HStack justify="space-between">
              <HStack gap={3}>
                <Avatar
                  size={{ base: "sm", md: "md" }}
                  src={booking.mentee?.avatar_url ?? "/fallback.jpg"}
                  name={booking.mentee?.full_name || `Participant ${booking.id}`}
                />
                <Box>
                  <Text fontWeight="semibold" fontSize={{ base: "sm", md: "md" }}>
                    {isOwner ? booking.mentee?.full_name || "Anonymous" : "Participant"}
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    Confirmed
                  </Text>
                </Box>
              </HStack>
              <Badge colorPalette="green" size={{ base: "sm", md: "md" }}>
                Booked
              </Badge>
            </HStack>
          </Box>
        ))
      ) : (
        <Box py={12} textAlign="center">
          <Text color="fg.muted" fontSize={{ base: "sm", md: "md" }}>
            No confirmed bookings yet
          </Text>
          <Text color="fg.subtle" fontSize="xs" mt={2}>
            {isOwner ? "Waiting for bookings" : "Be the first to book this session"}
          </Text>
        </Box>
      )}
    </VStack>
  );
};

export default ParticipantsTab;