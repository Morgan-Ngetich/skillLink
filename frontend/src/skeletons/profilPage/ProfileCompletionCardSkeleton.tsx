import {
  Box,
  VStack,
  HStack,
  Flex,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";

export default function ProfileCompletionCardSkeleton() {
  return (
    <Box
      p={6}
      borderRadius="xl"
      border="1px solid"
      borderColor="border.subtle"
      w="full"
    >
      <VStack align="stretch" gap={4}>
        {/* Header */}
        <Flex justify="space-between" align="center">
          <HStack>
            <Skeleton boxSize="40px" borderRadius="md" />
            <Skeleton height="20px" width="160px" />
          </HStack>
          <Skeleton height="28px" width="50px" />
        </Flex>

        {/* Progress */}
        <Skeleton height="8px" borderRadius="full" />
        <SkeletonText noOfLines={2} gap="2" />

        {/* Missing fields */}
        <VStack align="stretch" gap={2}>
          {[1, 2, 3].map((i) => (
            <HStack key={i}>
              <Skeleton boxSize="16px" borderRadius="full" />
              <Skeleton height="14px" width="70%" />
            </HStack>
          ))}
        </VStack>

        {/* Button */}
        <Skeleton height="44px" borderRadius="md" />
      </VStack>
    </Box>
  );
}
