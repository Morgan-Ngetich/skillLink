import {
  Box,
  HStack,
  VStack,
  Skeleton,
  SkeletonCircle,
} from '@chakra-ui/react';


export const MentorCardSkeleton = () => {
  return (
    <Box
      borderRadius="xl"
      boxShadow="xl"
      borderWidth="2px"
      borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
      minW={{ base: "250px", md: "300px" }}
    >
      {/* Cover Image Section */}
      <Box position="relative" borderRadius="xl">
        <Box>
          <Box position="relative" >
            {/* Banner skeleton */}
            <Skeleton aspectRatio={4 / 1} borderTopRadius="xl" />

            {/* Tags skeleton */}
            <HStack
              position="absolute"
              bottom="4px"
              right="10px"
              left="34%"
              gap={2}
              overflow={"hidden"}
            >
              <Skeleton height="20px" width="60px" borderRadius="md" />
              <Skeleton height="20px" width="80px" borderRadius="md" />
              <Skeleton height="20px" width="70px" borderRadius="md" />
            </HStack>

            {/* Avatar skeleton */}
            <Box position="absolute" bottom="-25px" left="20px">
              <SkeletonCircle
                size="60px"
                border="2px solid white"
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box pt={3} pb={5} px={4} mt={4}>
        <VStack align="start" w="100%" gap={2}>
          <HStack w="100%" justify="space-between" align="start">
            <Skeleton height="24px" width="120px" />
            <Skeleton height="20px" width="40px" />
          </HStack>

          <Skeleton height="18px" width="180px" />
        </VStack>

        {/* Bio skeleton */}
        <VStack align="start" mt={1} gap={1}>
          <Skeleton height="14px" width="100%" />
          <Skeleton height="14px" width="85%" />
        </VStack>

        {/* Skills skeleton */}
        <HStack gap={2} mt={4}>
          <Skeleton height="24px" width="70px" borderRadius="lg" />
          <Skeleton height="24px" width="90px" borderRadius="lg" />
          <Skeleton height="24px" width="80px" borderRadius="lg" />
        </HStack>

        {/* Stats & Location skeleton */}
        <HStack mt={4} justify="space-between">
          <Skeleton height="18px" width="80px" />
          <Skeleton height="18px" width="100px" />
        </HStack>

        {/* CTA Button skeleton - Only on desktop */}
        <Box hideBelow="md">
          <Skeleton height="40px" width="100%" borderRadius="md" mt={5} />
        </Box>
      </Box>
    </Box>
  );
};