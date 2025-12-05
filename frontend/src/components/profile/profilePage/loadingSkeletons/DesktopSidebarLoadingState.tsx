import { VStack, Box, HStack, Skeleton, SkeletonText, SimpleGrid, Flex } from "@chakra-ui/react";

const DesktopSidebarLoadingState= () => {
  return (
    <VStack gap={6} align="start" flex="0 0 36%" w="36%">
      {/* Tabs Section */}
      <Box
        w="full"
        bg="cardbg"
        borderRadius="lg"
        overflow="hidden"
      >
        {/* Horizontal Tab Headers */}
        <HStack gap={2} w="full" bg="bg">
          <Skeleton height="50px" flex="1" borderRadius="md" bg="bg.muted" border={"1px solid"} borderColor={"border.inverted"} />
          <Skeleton height="50px" flex="1" borderRadius="md" bg="bg.muted" border={"1px solid"} borderColor={"border.inverted"} />
          <Skeleton height="50px" flex="1" borderRadius="md" bg="bg.muted" border={"1px solid"} borderColor={"border.inverted"} />
        </HStack>


        {/* Tab Content */}
        <Box p={4}>
          {/* Header with title and button */}
          <HStack justify="space-between" align="center" mb={4}>
            <Skeleton height="20px" width="120px" bg="bg.muted" />
          </HStack>

          {/* Session/Service Cards Grid */}
          <SimpleGrid columns={2} gap={2}>
            {[1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                borderWidth="1px"
                borderRadius="2xl"
                borderColor="border.muted"
                overflow="hidden"
                bg="bg"
              >
                {/* Banner Image Skeleton */}
                <Skeleton height="150px" width="100%" borderRadius="0" />

                {/* Card Content */}
                <VStack align="start" gap={3} p={3}>
                  {/* Title */}
                  <Skeleton height="18px" width="85%" />

                  {/* Description */}
                  <SkeletonText noOfLines={2} gap={2} height="12px" />

                  {/* Badges/Tags */}
                  <HStack gap={2} wrap="wrap">
                    <Skeleton height="20px" width="60px" borderRadius="full" />
                    <Skeleton height="20px" width="75px" borderRadius="full" />
                  </HStack>

                  {/* Bottom info (price and duration) */}
                  <Flex justify="space-between" w="full" mt={1}>
                    <Skeleton height="20px" width="50px" />
                    <Skeleton height="20px" width="45px" />
                  </Flex>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* People Also Viewed Skeleton */}
      <Flex
        pt={4}
        pb={1}
        px={4}
        rounded="xl"
        border="1px solid"
        borderColor="border.subtle"
        shadow="sm"
        maxH="md"
        direction="column"
        w="100%"
        bg="cardbg"
      >
        {/* Header */}
        <Flex align="center" justify="space-between" mb={3}>
          <VStack align="start" gap={1}>
            <Skeleton height="18px" width="140px" bg="bg.muted"/>
            <Skeleton height="12px" width="160px" bg="bg.muted"/>
          </VStack>
          <Skeleton height="25px" width="90px" borderRadius="md" bg="bg.muted"/>
        </Flex>

        {/* Mentor Cards List */}
        <VStack gap={2} align="stretch">
          {[1, 2, 3, 4].map((i) => (
            <Box
              key={i}
              borderRadius="xl"
              bg="bg"
              borderWidth="1px"
              borderColor="border.subtle"
              p={2}
            >
              <Flex align="start" gap={3}>
                {/* Avatar */}
                <Skeleton boxSize="50px" borderRadius="full" flexShrink={0} />

                {/* Content */}
                <VStack align="start" gap={1.5} flex={1} minW={0}>
                  <Flex w="100%" justify="space-between" align="start">
                    <VStack align="start" gap={1}>
                      <Skeleton height="14px" width="100px" />
                      <Skeleton height="12px" width="120px" />
                    </VStack>
                    <Skeleton height="14px" width="50px" />
                  </Flex>

                  {/* Stats */}
                  <HStack gap={2}>
                    <Skeleton height="12px" width="80px" />
                    <Skeleton height="12px" width="70px" />
                  </HStack>
                </VStack>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Flex>
    </VStack>
  );
};

export default DesktopSidebarLoadingState;