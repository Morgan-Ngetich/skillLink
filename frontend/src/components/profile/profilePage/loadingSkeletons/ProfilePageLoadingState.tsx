import { Box, VStack, HStack, Skeleton, SkeletonCircle, SkeletonText, Separator } from '@chakra-ui/react';

const ProfilePageLoadingState = () => {
  return (
    <Box
      borderRadius="lg"
      overflow="hidden"
      boxShadow={{ base: "none", md: "sm" }}
      w="full"
      border={{ base: "none", md: "1px solid" }}
      borderColor="border.subtle"
      bg="bg"
    >
      {/* Banner Skeleton with gradient effect */}
      <Box position="relative" h={{ base: "100px", md: "150px" }}>
        <Skeleton 
          w="full" 
          h="100%" 
        />

        {/* Avatar Skeleton */}
        <Box
          position="absolute"
          bottom={{ base: "-40px", md: "-50px" }}
          left={{ base: "20px", md: "30px" }}
        >
          <SkeletonCircle
            boxSize={{ base: "80px", md: "100px" }}
            border="4px solid"
            borderColor="bg"
          />
        </Box>

        {/* Edit button skeleton (top right) */}
        <Box position="absolute" top="10px" right="10px">
          <SkeletonCircle size="32px" />
        </Box>
      </Box>

      {/* Profile Info Skeleton */}
      <Box px={{ base: 4, md: 6 }} pt={{ base: 12, md: 14 }} pb={4}>
        <VStack align="start" gap={3} mb={4}>
          {/* Name */}
          <Skeleton height="28px" width="220px" borderRadius="md" />
          
          {/* Title */}
          <Skeleton height="18px" width="280px" borderRadius="md" />
          
          {/* Location/Stats */}
          <HStack gap={4} flexWrap="wrap" mt={2}>
            <HStack gap={2}>
              <SkeletonCircle size="16px" />
              <Skeleton height="14px" width="100px" />
            </HStack>
            <HStack gap={2}>
              <SkeletonCircle size="16px" />
              <Skeleton height="14px" width="80px" />
            </HStack>
            <HStack gap={2}>
              <SkeletonCircle size="16px" />
              <Skeleton height="14px" width="90px" />
            </HStack>
          </HStack>

          {/* Tags/Skills */}
          <HStack gap={2} mt={3} flexWrap="wrap">
            <Skeleton height="28px" width="90px" borderRadius="full" />
            <Skeleton height="28px" width="110px" borderRadius="full" />
            <Skeleton height="28px" width="75px" borderRadius="full" />
            <Skeleton height="28px" width="85px" borderRadius="full" />
          </HStack>
        </VStack>

        <Separator my={5} display={{ base: 'none', md: 'block' }} />

        {/* Tabs Skeleton */}
        <HStack 
          gap={3} 
          mb={6} 
          overflowX="auto" 
          pb={2}
          css={{
            '&::-webkit-scrollbar': {
              display: 'none'
            }
          }}
        >
          <Skeleton height="36px" width="100px" borderRadius="md" />
          <Skeleton height="36px" width="110px" borderRadius="md" />
          <Skeleton height="36px" width="95px" borderRadius="md" />
          <Skeleton height="36px" width="105px" borderRadius="md" />
        </HStack>

        {/* Content Skeleton */}
        <VStack align="stretch" gap={6} mt={6}>
          {/* About Section */}
          <Box>
            <Skeleton height="22px" width="80px" mb={3} borderRadius="md" />
            <SkeletonText noOfLines={4} gap={2} height="14px" />
          </Box>

          <Separator />

          {/* Experience Section */}
          <Box>
            <Skeleton height="22px" width="120px" mb={4} borderRadius="md" />
            <VStack align="stretch" gap={4}>
              {[1, 2].map((i) => (
                <HStack key={i} align="start" gap={3}>
                  <SkeletonCircle size={{ base: "40px", md: "50px" }} flexShrink={0} />
                  <VStack align="start" gap={2} flex="1">
                    <Skeleton height="18px" width={{ base: "180px", md: "220px" }} />
                    <Skeleton height="14px" width={{ base: "140px", md: "180px" }} />
                    <Skeleton height="12px" width="110px" />
                    <SkeletonText noOfLines={2} gap={1} height="12px" mt={2} />
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </Box>

          <Separator />

          {/* Education Section */}
          <Box>
            <Skeleton height="22px" width="100px" mb={4} borderRadius="md" />
            <HStack align="start" gap={3}>
              <SkeletonCircle size={{ base: "40px", md: "50px" }} flexShrink={0} />
              <VStack align="start" gap={2} flex="1">
                <Skeleton height="18px" width={{ base: "200px", md: "240px" }} />
                <Skeleton height="14px" width={{ base: "160px", md: "200px" }} />
                <Skeleton height="12px" width="130px" />
              </VStack>
            </HStack>
          </Box>

          <Separator />

          {/* Skills Section */}
          <Box>
            <Skeleton height="22px" width="70px" mb={4} borderRadius="md" />
            <HStack gap={2} flexWrap="wrap">
              {[80, 95, 70, 110, 85, 100, 75, 90].map((width, i) => (
                <Skeleton key={i} height="32px" width={`${width}px`} borderRadius="md" />
              ))}
            </HStack>
          </Box>

          <Separator />

          {/* Interests Section */}
          <Box>
            <Skeleton height="22px" width="90px" mb={4} borderRadius="md" />
            <HStack gap={2} flexWrap="wrap">
              {[75, 105, 85, 95, 70, 100].map((width, i) => (
                <Skeleton key={i} height="32px" width={`${width}px`} borderRadius="md" />
              ))}
            </HStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default ProfilePageLoadingState;