import { Box, Flex, HStack, VStack, Skeleton, SkeletonCircle, useBreakpointValue } from '@chakra-ui/react';

const HeroCardSkeleton = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isMobileLayout = isMobile;

  return (
    <Flex
      direction={isMobileLayout ? 'column' : { base: 'column', md: 'row' }}
      w="full"
      maxW="1200px"
      minH={{ base: "auto", md: "21em" }}
      h="auto"
      rounded="xl"
      shadow="md"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.200"
    >
      {/* Left Side - Session Info Skeleton */}
      <Box flex={1} minW={0} p={{ base: 3, md: 4 }} position="relative">
        {/* Top section - Avatars and Badge */}
        <Flex justify="space-between" align="center" mb={{ base: 3, md: 4 }}>
          {/* Avatar Group */}
          <HStack>
            <SkeletonCircle size={{ base: '6', md: '8' }} />
            <SkeletonCircle size={{ base: '6', md: '8' }} />
            <SkeletonCircle size={{ base: '6', md: '8' }} />
          </HStack>

          {/* Date/Time Badge */}
          <Skeleton height={{ base: '24px', md: '28px' }} width={{ base: '180px', md: '220px' }} rounded="md" />
        </Flex>

        {/* Spacer */}
        <Box flex={1} minH={isMobileLayout ? "20px" : "70px"} />

        {/* Bottom section - Mentor Info */}
        <Box mb={{ base: 3, md: 4 }}>
          <HStack gap={2} mb={{ base: 2, md: 3 }}>
            <SkeletonCircle size={{ base: '10', md: '12' }} />
            <VStack align="start" gap={1} flex={1}>
              <Skeleton height={{ base: '14px', md: '18px' }} width="120px" />
              <Skeleton height={{ base: '12px', md: '14px' }} width="180px" />
            </VStack>
          </HStack>

          <Skeleton height={{ base: '24px', md: '28px' }} width="80%" mb={2} />
        </Box>

        {/* Booking section skeleton */}
        <Box
          bg="whiteAlpha.900"
          _dark={{ bg: "blackAlpha.800" }}
          p={{ base: 3, md: 4 }}
          borderRadius="lg"
          border="1px solid"
          borderColor="border.emphasized"
        >
          <Skeleton height="14px" width="100px" mb={2} />

          <Flex justify="space-between" align="center">
            <VStack align="start" gap={1}>
              <Skeleton height={{ base: '18px', md: '22px' }} width="100px" />
              <Skeleton height="12px" width="80px" />
            </VStack>

            <VStack align="end" gap={1}>
              <Skeleton height="16px" width="100px" />
              <Skeleton height={{ base: '28px', md: '32px' }} width="100px" rounded="full" />
            </VStack>
          </Flex>
        </Box>
      </Box>

      {/* Right Side - Info Panel Skeleton (Desktop only) */}
      {!isMobileLayout && (
        <Box flex={1} minW={0} p={6} display={{ base: 'none', md: 'block' }}>
          {/* Tabs skeleton */}
          <HStack mb={4} gap={4}>
            <Skeleton height="32px" width="80px" />
            <Skeleton height="32px" width="120px" />
            <Skeleton height="32px" width="100px" />
          </HStack>

          {/* Content skeleton */}
          <VStack align="start" gap={4}>
            {/* Date */}
            <Skeleton height="16px" width="200px" />

            {/* Title */}
            <Skeleton height="28px" width="60%" />

            {/* Description */}
            <Skeleton height="14px" width="100%" />
            <Skeleton height="14px" width="95%" />

            {/* Tags */}
            <HStack gap={2} flexWrap="wrap">
              <Skeleton height="24px" width="70px" rounded="md" />
              <Skeleton height="24px" width="90px" rounded="md" />
              <Skeleton height="24px" width="80px" rounded="md" />
            </HStack>

            {/* Mentor card */}
            <Skeleton height="80px" width="100%" rounded="md" />
          </VStack>
        </Box>
      )}
    </Flex>
  );
};

export default HeroCardSkeleton;