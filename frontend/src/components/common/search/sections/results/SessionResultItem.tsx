import { Box, VStack, Text, HStack } from "@chakra-ui/react";
import { LuCalendar } from "react-icons/lu";
import { format, parseISO, isValid } from "date-fns";
import { formatDuration } from "@/utils/calendarDataTransformer";
import type { MentorSessionPublic } from "@/client";

interface SessionResultItemProps {
  session: MentorSessionPublic;
}

export const SessionResultItem = ({ session }: SessionResultItemProps) => {
  const startDate = session.start_time ? parseISO(session.start_time) : null;

  return (
    <Box px={4} py={3} display="flex" alignItems="start" gap={3}>
      <Box
        boxSize="12"
        borderRadius="md"
        bg="blue.subtle"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
        bgImage={session?.cover_image ? `url(${session.cover_image})` : undefined}
        bgSize="cover"
      >
        <LuCalendar size={20} color="white" />
      </Box>
      <VStack align="start" gap={1} flex="1">
        <HStack>
          <Text fontWeight="medium" fontSize="md" lineClamp={1}>
            {session.title}
          </Text>
          <Text>•</Text>
          <HStack gap={2}>
            <LuCalendar size={14} style={{ opacity: 0.6 }} />
            <Text fontSize="xs" color="fg.muted" fontWeight="medium">
              SESSION
            </Text>
          </HStack>
        </HStack>
        <Text fontSize="sm" color="fg.muted" lineClamp={1}>
          {session.description}
        </Text>
        <HStack gap={2} fontSize="xs" color="fg.muted">
          {startDate && isValid(startDate) && (
            <Text>{format(startDate, "MMM d, yyyy")}</Text>
          )}
          <Text>•</Text>
          <Text>{formatDuration(session.duration_minutes)} min</Text>
          <Text>•</Text>
          <Text fontWeight="semibold">
            {session.price_usd ? `$${session.price_usd}` : "Free"}
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
};