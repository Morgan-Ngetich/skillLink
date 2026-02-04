import { Stack, Skeleton, SkeletonText, Box, HStack } from "@chakra-ui/react";

const SessionDetailSkeleton = () => {
  return (
    <Stack gap={6}>
      {/* Session Title Skeleton */}
      <Box>
        <Skeleton height="28px" width="70%" mb={2} />
        <Skeleton height="16px" width="40%" />
      </Box>

      {/* Date and Time Section */}
      <Stack gap={3}>
        <HStack gap={4}>
          <Box flex={1}>
            <Skeleton height="14px" width="60px" mb={2} />
            <Skeleton height="20px" width="100%" />
          </Box>
          <Box flex={1}>
            <Skeleton height="14px" width="60px" mb={2} />
            <Skeleton height="20px" width="100%" />
          </Box>
        </HStack>
      </Stack>

      {/* Duration and Format */}
      <Stack gap={3}>
        <HStack gap={4}>
          <Box flex={1}>
            <Skeleton height="14px" width="70px" mb={2} />
            <Skeleton height="20px" width="100%" />
          </Box>
          <Box flex={1}>
            <Skeleton height="14px" width="50px" mb={2} />
            <Skeleton height="20px" width="100%" />
          </Box>
        </HStack>
      </Stack>

      {/* Description Section */}
      <Box>
        <Skeleton height="16px" width="100px" mb={3} />
        <SkeletonText noOfLines={4} gap={2} />
      </Box>

      {/* Topics/Tags Section */}
      <Box>
        <Skeleton height="16px" width="80px" mb={3} />
        <HStack gap={2} flexWrap="wrap">
          <Skeleton height="24px" width="80px" borderRadius="full" />
          <Skeleton height="24px" width="100px" borderRadius="full" />
          <Skeleton height="24px" width="90px" borderRadius="full" />
        </HStack>
      </Box>

      {/* Additional Info */}
      <Stack gap={2}>
        <HStack justify="space-between">
          <Skeleton height="16px" width="120px" />
          <Skeleton height="16px" width="60px" />
        </HStack>
        <HStack justify="space-between">
          <Skeleton height="16px" width="100px" />
          <Skeleton height="16px" width="80px" />
        </HStack>
      </Stack>
    </Stack>
  );
};

export default SessionDetailSkeleton;