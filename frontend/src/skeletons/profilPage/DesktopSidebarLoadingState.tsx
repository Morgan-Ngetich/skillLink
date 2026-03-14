import { VStack, Box, HStack, Skeleton, SimpleGrid } from "@chakra-ui/react";
import { PeopleAlsoViewedSkeleton } from "../PeopleAlsoViewedSkeleton";
import SessionCardSkeleton from "../SessionCardSkeleton";

const DesktopSidebarLoadingState = () => {
  return (
    <VStack gap={6} align="start" flex="0 0 36%" w="36%">
      {/* Tabs Section */}
      <Box
        w="full"
        borderRadius="lg"
        overflow="hidden"
        border="1px solid"
        borderColor="border.muted"
      >

        {/* Tab Headers - matches enclosed variant */}
        <HStack gap={2} w="full">
          {/* Active tab - sessions */}
          <Skeleton
            height="43px"
            flex="1"
            borderRadius="md"
            border="1px solid"
            borderColor="border.muted"
            borderBottom="2px solid"
          />
          <Skeleton
            height="43px"
            flex="1"
            borderRadius="md"
            border="1px solid"
            borderColor="border.muted"
          />
          <Skeleton
            height="43px"
            flex="1"
            borderRadius="md"
            border="1px solid"
            borderColor="border.panel"
          />
        </HStack>

        {/* Tab Content - Sessions default */}
        <Box py={4}>
          {/* Header with title and add button — matches SessionsContent header */}
          <VStack justify="space-between" align="start" mb={4} maxW="60%">
            <Skeleton height="15px" width="100px" rounded="md"  />
            <HStack gap={2} w="full"  mt={3} mb={3}>
              {/* Active tab - sessions */}
              <Skeleton
                height="43px"
                flex="1"
                borderRadius="md"
                border="1px solid"
                borderColor="border.muted"
                borderBottom="2px solid"
              />
              <Skeleton
                height="43px"
                flex="1"
                borderRadius="md"
                border="1px solid"
                borderColor="border.muted"
              />
            </HStack>
          </VStack>

          {/* Session Cards */}
          <SimpleGrid columns={1} gap={3} maxH={"70vh"} overflowY={"auto"}>
            {[1, 2, 3].map((i) => (
              <SessionCardSkeleton key={i} />
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