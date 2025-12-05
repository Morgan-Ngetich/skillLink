import { Stack, VStack, HStack, Box, Text } from "@chakra-ui/react";
import { LuDollarSign } from "react-icons/lu";
import type { MentorSessionPublic } from "@/client";

interface SessionPriceAvailabilityProps {
  session: MentorSessionPublic;
}

const SessionPriceAvailability = ({ session }: SessionPriceAvailabilityProps) => {
  const isFull = session.is_full;
  const spotsLeft = session.available_spots || 0;

  return (
    <Stack
      direction={"row"}
      gap={4}
      bg="bg.emphasized"
      borderRadius="md"
    >
      {/* Availability */}
      <VStack flex="1" p={2} rounded="lg">
        <Text
          fontSize="xs"
          fontWeight="semibold"
          textTransform="uppercase"
          color="fg.muted"
          mb={1}
          letterSpacing="wide"
        >
          Availability
        </Text>
        <Text
          fontWeight="bold"
          fontSize={{ base: "2xl", md: "3xl" }}
          color={isFull ? "fg.subtle" : "gray.fg"}
          lineHeight="none"
        >
          {session.confirmed_bookings || 0} / {session.max_bookings || 0}
        </Text>
        <Text fontSize="sm" color={isFull ? "fg.muted" : "fg.subtle"} mt={1}>
          {isFull
            ? "Session is full"
            : `${spotsLeft} ${spotsLeft === 1 ? "spot" : "spots"} left`}
        </Text>
      </VStack>

      {/* Price */}
      <VStack flex="1" p={2} my="auto">
        <HStack gap={0} mb={1}>
          <Box color="colorPalette.fg" aria-hidden="true">
            <LuDollarSign size={18} />
          </Box>
          <Text
            fontSize="xs"
            fontWeight="semibold"
            textTransform="uppercase"
            color="fg.muted"
            letterSpacing="wide"
          >
            Price
          </Text>
        </HStack>
        {session.price_usd === 0 || !session.price_usd ? (
          <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="gray.fg">
            Free
          </Text>
        ) : (
          <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold">
            ${session.price_usd}
          </Text>
        )}
      </VStack>
    </Stack>
  );
};

export default SessionPriceAvailability;