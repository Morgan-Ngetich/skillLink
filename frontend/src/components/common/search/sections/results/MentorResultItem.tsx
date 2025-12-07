import { Box, VStack, Text, HStack, Badge } from "@chakra-ui/react";
import { LuUser } from "react-icons/lu";
import { Avatar } from "@/components/ui";
import type { UserPublic } from "@/client";

interface MentorResultItemProps {
  mentor: UserPublic;
}

export const MentorResultItem = ({ mentor }: MentorResultItemProps) => {
  return (
    <Box px={4} py={3} display="flex" alignItems="center" gap={3}>
      <Avatar boxSize="12" src={mentor.avatar_url} name={mentor.full_name} />
      <VStack align="start" gap={1} flex="1">
        <HStack gap={2}>
          <Text fontWeight="medium" fontSize="md">
            {mentor.full_name}
          </Text>
          <Text>•</Text>
          <HStack gap={2}>
            <LuUser size={14} style={{ opacity: 0.6 }} />
            <Text fontSize="xs" color="fg.muted" fontWeight="medium">
              MENTOR
            </Text>
          </HStack>
        </HStack>
        <Text fontSize="sm" color="fg.muted" lineClamp={1}>
          {mentor.profile?.title}
        </Text>
        {mentor.profile?.skills && mentor.profile.skills.length > 0 && (
          <HStack gap={1.5} wrap="wrap" mt={1}>
            {mentor.profile.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} size="sm" colorPalette="purple" variant="subtle">
                {skill}
              </Badge>
            ))}
          </HStack>
        )}
      </VStack>
    </Box>
  );
};