import { Box, Flex, HStack, VStack, Skeleton, SkeletonCircle } from "@chakra-ui/react";

export const SessionCardSkeleton = () => {
  return (
    <Box
      w="full"
      maxW="450px"
      h="full"
      minH="260px"
      position="relative"
      rounded="lg"
      overflow="hidden"
      bg="bg.muted"
      border="1px solid"
      borderColor="border.emphasized"
    >
      {/* Dark overlay */}
      <Box position="absolute" inset={0} bg="blackAlpha.200" />

      {/* Content */}
      <Flex
        position="relative"
        direction="column"
        h="full"
        px={{ base: 2, md: 3 }}
        py={1}
        zIndex={1}
      >
        {/* Header: Attendees + Timer + Menu */}
        <Flex justify="space-between" align="center" mb={4}>
          {/* Left side - Attendees skeleton */}
          <HStack gap={-4}>
            <SkeletonCircle size={{ base: "6", md: "8" }} />
            <SkeletonCircle size={{ base: "6", md: "8" }} />
            <SkeletonCircle size={{ base: "6", md: "8" }} />
          </HStack>

          {/* Right side - Timer Badge skeleton */}
          <Skeleton height="24px" width="180px" borderRadius="md" />
        </Flex>

        {/* Spacer */}
        <Box flex={1} />

        {/* Mentor Info skeleton */}
        <Box mb={3}>
          <HStack gap={2} align="start" mb={2}>
            <SkeletonCircle size={{ base: "8", md: "10" }} />
            <VStack align="start" gap={1} flex={1}>
              <Skeleton height="14px" width="120px" />
              <Skeleton height="12px" width="150px" />
            </VStack>
          </HStack>

          <HStack justify="space-between" align="start" gap={2}>
            <VStack align="start" gap={1} flex={1}>
              <Skeleton height="20px" width="80%" />
              <Skeleton height="20px" width="60%" />
            </VStack>
          </HStack>
        </Box>

        {/* Booking Section skeleton */}
        <Box
          bg="whiteAlpha.900"
          _dark={{ bg: "blackAlpha.800" }}
          py={2}
          px={3}
          borderRadius="lg"
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor="whiteAlpha.300"
        >
          <Skeleton height="12px" width="100px" mb={2} />

          <Flex justify="space-between" align="center">
            <Box flex={1}>
              <Skeleton height="20px" width="100px" mb={1} />
              <Skeleton height="12px" width="80px" />
            </Box>

            <VStack align="end" gap={2}>
              <HStack>
                <Skeleton height="14px" width="60px" />
                <Skeleton height="14px" width="8px" />
                <Skeleton height="14px" width="40px" />
              </HStack>

              <Skeleton height="32px" width="120px" borderRadius="full" />
            </VStack>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};