import { VStack, Box, HStack, Skeleton, SkeletonText, SimpleGrid, Flex } from "@chakra-ui/react";
import { PeopleAlsoViewedSkeleton } from "../PeopleAlsoViewedSkeleton";

const DesktopSidebarLoadingState = () => {
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
          <Skeleton height="50px" flex="1" borderRadius="md" bg="bg.muted" border={"1px solid"} borderColor={"border.muted"} />
          <Skeleton height="50px" flex="1" borderRadius="md" bg="bg.muted" border={"1px solid"} borderColor={"border.muted"} />
          <Skeleton height="50px" flex="1" borderRadius="md" bg="bg.muted" border={"1px solid"} borderColor={"border.muted"} />
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
                borderColor="border.muted"
                borderRadius="2xl"
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
      <PeopleAlsoViewedSkeleton />
    </VStack>
  );
};

export default DesktopSidebarLoadingState;