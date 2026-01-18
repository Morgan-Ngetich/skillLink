import {
  Box,
  SimpleGrid,
  VStack,
  HStack,
} from "@chakra-ui/react";
import HeroCardSkeleton from "./HeroCardSkeleton";
import FeaturedMentorsSkeleton from "./FeaturedMentorsSkeleton";
import { PeopleAlsoViewedSkeleton } from "../PeopleAlsoViewedSkeleton";
import GrowthStats from "@/components/homepage/GrowthStats";

const HomePageSkeleton = () => {
  return (
    <>
      <Box py={{ base: 4, md: 6 }} px={{ base: 4, md: 8 }} maxW="1600px" mx="auto">
        {/* Mobile Layout - Hidden on Desktop */}
        <Box display={{ base: "block", xl: "none" }}>
          <VStack gap={6} align="stretch">
            {/* Hero Section - Progressive Enhancement */}
            <Box>
              <Box
                w="100%"
                overflow="hidden"
                borderRadius="xl"
              >
                <Box>
                  <HeroCardSkeleton />
                </Box>
              </Box>

              {/* Slider Dots */}
              <HStack justify="center" mt={4} gap={2}>
                {[0, 1].map((i) => (
                  <Box
                    key={i}
                    h="8px"
                    w={0 === i ? "24px" : "8px"}
                    bg={0 === i ? "teal.500" : "gray.300"}
                    _dark={{
                      bg: 0 === i ? "teal.400" : "gray.600"
                    }}
                    borderRadius="full"
                    cursor="pointer"
                  />
                ))}
              </HStack>
            </Box>

            {/* Featured Mentors */}
            <Box>
              <FeaturedMentorsSkeleton />
            </Box>

            {/* Top Mentors */}
            <Box>
              <PeopleAlsoViewedSkeleton />
            </Box>
          </VStack>
        </Box>

        {/* Desktop Layout - Hidden on Mobile */}
        <Box display={{ base: "none", xl: "block" }}>
          <SimpleGrid columns={3} gap={6} alignItems="start">
            {/* Left Column - Main Content (2/3 width) */}
            <VStack
              gridColumn="span 2"
              gap={6}
              align="stretch"
            >
              <HeroCardSkeleton />
              <FeaturedMentorsSkeleton />
            </VStack>

            {/* Right Column - Sidebar (1/3 width) */}
            <VStack gap={6} align="stretch">
              <GrowthStats />
              <Box position="sticky" top="80px">
                <PeopleAlsoViewedSkeleton />
              </Box>
            </VStack>
          </SimpleGrid>
        </Box>
      </Box>

    </>
  );
};

export default HomePageSkeleton;