import { VStack, Box, HStack, Text, Badge, Separator } from "@chakra-ui/react";
import { Field, StyledTextarea } from "@/components/ui";
import { LuLock } from "react-icons/lu";
import type { MentorSessionPublic, UserPublic } from "@/client";
import MentorInfo from "../sections/MentorInfo";
import SessionDateTime from "../sections/SessionDateTime";
import SessionTags from "../sections/SessionTags";
import SessionPriceAvailability from "../sections/SessionPriceAvailability";

interface SessionDetailsTabProps {
  session: MentorSessionPublic;
  userData?: UserPublic;
  isOwner: boolean;
  isFull: boolean;
  requiresMessage?: boolean;
  message: string;
  setMessage: (msg: string) => void;
}

const SessionDetailsTab = ({
  session,
  userData,
  isOwner,
  isFull,
  requiresMessage,
  message,
  setMessage,
}: SessionDetailsTabProps) => {
  return (
    <VStack align="stretch" gap={6}>
      {/* Mentor Info - Only show if not owner */}
      {!isOwner && userData && <MentorInfo userData={userData} />}

      {/* Session Title & Status */}
      <Box>
        <HStack mb={2} flexWrap="wrap" gap={2}>
          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" lineHeight="shorter">
            {session.title}
          </Text>
          {!session.is_public && (
            <Badge colorPalette="purple" variant="subtle" size="sm">
              <HStack gap={1}>
                <LuLock size={12} />
                <Text>Private</Text>
              </HStack>
            </Badge>
          )}
          {!session.is_active && (
            <Badge colorPalette="red" variant="solid" size="sm">
              Inactive
            </Badge>
          )}
        </HStack>
        {session.description && (
          <Text fontSize={{ base: "sm", md: "md" }} color="fg.muted" lineHeight="relaxed">
            {session.description}
          </Text>
        )}
      </Box>

      <Separator />

      {/* Date & Time Section */}
      <SessionDateTime session={session} />

      <Separator />

      {/* Tags */}
      {session.tags && session.tags.length > 0 && <SessionTags tags={session.tags} />}

      {/* Price & Availability */}
      <SessionPriceAvailability session={session} />

      {/* Booking Message - Only for mentees */}
      {!isOwner && !isFull && requiresMessage && (
        <>
          <Separator />
          <Box>
            <Field
              label={"Introduction Message (Required)"}
              required={requiresMessage}
              helperText="Tell the mentor why you're interested in this session"
            >
              <StyledTextarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="I'm interested in this session because..."
                rows={4}
                fontSize={{ base: "sm", md: "md" }}
                aria-label="Message to mentor"
              />
            </Field>
          </Box>
        </>
      )}
    </VStack>
  );
};

export default SessionDetailsTab;