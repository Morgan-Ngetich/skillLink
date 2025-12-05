import { Box, HStack, Stack, Text } from "@chakra-ui/react";
import { LuCalendar, LuClock, LuMapPin } from "react-icons/lu";
import { FaMapLocation, FaVideo } from "react-icons/fa6";
import { format } from "date-fns";
import { formatDuration } from "@/utils/calendarDataTransformer";
import type { MentorSessionPublic } from "@/client";
import { Button } from "@chakra-ui/react";
import { useAuth } from "@/hooks/auth/useAuth";

interface SessionDateTimeProps {
  session: MentorSessionPublic;
}

const SessionDateTime = ({ session }: SessionDateTimeProps) => {
  const { user } = useAuth();
  const isOwner = user?.is_mentor && session.mentor_id === user.id;
  const userHasBooked = session.user_has_booked;
  const canViewLocation = isOwner || userHasBooked;
  const showJoinButtons = canViewLocation && (session.meeting_link || session.physical_address);

  return (
    <Box role="group" aria-label="Date and time information">
      <Text
        fontSize="xs"
        fontWeight="semibold"
        textTransform="uppercase"
        color="fg.muted"
        mb={3}
        letterSpacing="wide"
      >
        Date & Time
      </Text>
      <Stack gap={3}>
        {/* Date */}
        <HStack gap={3}>
          <Box color="colorPalette.fg" aria-hidden="true">
            <LuCalendar size={20} />
          </Box>
          <HStack gap={2} textAlign={"center"}>
            <Text fontSize="sm" fontWeight="medium">
              {format(new Date(session.start_time), "EEEE, MMMM d, yyyy")}
            </Text>
            -{" "}
            <Text fontSize="sm" fontWeight="medium">
              {format(new Date(session.end_time), "EEEE, MMMM d, yyyy")}
            </Text>
          </HStack>
        </HStack>

        {/* Time */}
        <HStack gap={3}>
          <Box color="colorPalette.fg" aria-hidden="true">
            <LuClock size={20} />
          </Box>
          <Box>
            <Text fontSize={{ base: "sm", md: "md" }} fontWeight="medium">
              {format(new Date(session.start_time), "h:mm a")} -{" "}
              {format(new Date(session.end_time), "h:mm a")}
            </Text>
            <Text fontSize="xs" color="fg.muted">
              {formatDuration(session.duration_minutes)} duration
            </Text>
          </Box>
        </HStack>

        {/* Location */}
        {canViewLocation && showJoinButtons ? (
          <HStack gap={3}>
            <LuMapPin size={20} />
            <HStack w="100%" justify="space-between">
              <Text fontSize="sm" fontWeight="medium">
                {session.location_type === "online" ? "Virtual Meeting" : "In-Person"}
              </Text>

              {session.location_type === "online" && session.meeting_link ? (
                <Button
                  size="sm"
                  colorPalette="blue"
                  onClick={() => window.open(session.meeting_link, "_blank")}
                >
                  <FaVideo />
                  Join Session
                </Button>
              ) : session.physical_address ? (
                <Button
                  size="sm"
                  colorPalette="blue"
                  onClick={() => {
                    const encoded = encodeURIComponent(session.physical_address!);
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encoded}`,
                      "_blank"
                    );
                  }}
                >
                  <FaMapLocation />
                  Get Location
                </Button>
              ) : null}
            </HStack>
          </HStack>
        ) : !canViewLocation ? (
          <HStack gap={3}>
            <LuMapPin size={20} />
            <Box>
              <Text fontSize="sm" fontWeight="medium">
                {session.location_type === "online" ? "Virtual Meeting" : "In-Person"}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                Details available after booking
              </Text>
            </Box>
          </HStack>
        ) : null}
      </Stack>
    </Box>
  );
};

export default SessionDateTime;