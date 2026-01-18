import {
  Box,
  VStack,
  HStack,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";

export default function BecomeMentorCardSkeleton() {
  return (
    <Box
      p={6}
      borderRadius="2xl"
      border="2px solid"
      borderColor="border.subtle"
      w="full"
    >
      <VStack gap={6} align="start">
        {/* Header */}
        <HStack>
          <Skeleton boxSize="32px" borderRadius="md" />
          <Skeleton height="28px" width="180px" />
        </HStack>

        <SkeletonText noOfLines={2} gap="2" />

        {/* Feature list */}
        <VStack align="start" gap={3} w="full">
          {[1, 2, 3].map((i) => (
            <HStack key={i}>
              <Skeleton boxSize="20px" borderRadius="full" />
              <Skeleton height="14px" width="75%" />
            </HStack>
          ))}
        </VStack>

        {/* CTA */}
        <Skeleton height="48px" w="full" borderRadius="lg" />
      </VStack>
    </Box>
  );
}
