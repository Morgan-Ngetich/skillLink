import { Box, HStack, Text, Badge } from "@chakra-ui/react";

interface SessionTagsProps {
  tags: string[];
}

const SessionTags = ({ tags }: SessionTagsProps) => {
  return (
    <Box>
      <Text
        fontSize="xs"
        fontWeight="semibold"
        textTransform="uppercase"
        color="fg.muted"
        mb={3}
        letterSpacing="wide"
      >
        Topics
      </Text>
      <HStack gap={2} flexWrap="wrap">
        {tags.map((tag, i) => (
          <Badge
            key={i}
            variant="subtle"
            colorPalette="blue"
            size={{ base: "sm", md: "md" }}
          >
            {tag}
          </Badge>
        ))}
      </HStack>
    </Box>
  );
};

export default SessionTags;