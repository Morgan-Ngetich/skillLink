import { Box, Stack, HStack, Text, Button } from "@chakra-ui/react";
import { Avatar } from "@/components/ui";
import type { UserPublic } from "@/client";

interface MentorInfoProps {
  userData: UserPublic;
}

const MentorInfo = ({ userData }: MentorInfoProps) => {
  return (
    <Box
      p={2}
      bg="bg.emphasized"
      rounded="lg"
      borderWidth="1px"
      borderColor="border.muted"
    >
      <Stack
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "start", sm: "center" }}
        gap={3}
      >
        <HStack gap={3}>
          <Avatar
            size={{ base: "md", md: "lg" }}
            src={userData.avatar_url || "https://via.placeholder.com/150"}
            name={userData.full_name || "Mentor"}
          />
          <Box>
            <Text fontWeight="semibold" lineHeight="short">
              {userData.full_name}
            </Text>
            <Text fontSize="sm" color="fg.muted" lineHeight="short">
              {userData.profile?.title}
            </Text>
          </Box>
        </HStack>
        <Button
          size={{ base: "sm", md: "md" }}
          variant="subtle"
          w={{ base: "full", sm: "auto" }}
          border="1px solid"
          borderColor="border.emphasized"
        >
          View Profile
        </Button>
      </Stack>
    </Box>
  );
};

export default MentorInfo;