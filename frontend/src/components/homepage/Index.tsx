import {
  Box,
  SimpleGrid,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { useKeenSlider } from "keen-slider/react";
import { useState, useEffect } from "react";

import HeroCard from "./herocard/HeroCard";
import GrowthStats from "./GrowthStats";
import TopMentors from "./TopMentors";
import FeaturedMentors from "./FeaturedMentors";

import "keen-slider/keen-slider.min.css";
import { usePublicMentors } from "@/hooks/public/usePublicMentors";
import SessionDetailModal from "../dashboard/mentor/sessions/sessionDetails/Index";
import { useRouter, useSearch } from "@tanstack/react-router";
import { useProfilePageHandlers } from "@/hooks/public/useProfilePageHandlers";

const Home = () => {
  const router = useRouter();
  const search = useSearch({ strict: false });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const {
    // FeaturedMentors
    featuredMentors,
    isLoadingFeaturedMentors,

    featuredSessions,
    isLoadingFeaturedSessions
  } = usePublicMentors()


  const [sliderRef, sliderInstanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: false,
      slides: {
        perView: 1,
        spacing: 16,
      },
      drag: true,
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel);
      },
    },
    []
  );

  // Detect when client-side hydration is complete
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Find selected session from URL
  const selectedSessionFromUrl = search.sessionDetailId
    ? featuredSessions?.find((s) => s.uuid === search.sessionDetailId)
    : null;

  // Create minimal handlers object for homepage
  const handlers = useProfilePageHandlers({
    router,
    search,
    // These are required by the hook but not used on homepage
    setIsDeleteSessionDialogOpen: () => { },
    sessionToDelete: null,
    setSessionToDelete: () => { },
    deleteSession: () => { },
    setIsDeleteServiceDialogOpen: () => { },
    serviceToDelete: null,
    setServiceToDelete: () => { },
    deleteService: () => { },
  });

  return (
    <>
      <Box py={{ base: 4, md: 6 }} px={{ base: 4, md: 8 }} maxW="1600px" mx="auto">
        {/* Mobile Layout - Hidden on Desktop */}
        <Box display={{ base: "block", xl: "none" }}>
          <VStack gap={6} align="stretch">
            {/* Hero Section - Progressive Enhancement */}
            {isMounted ? (
              // Client-side: Show slider with both cards
              <Box>
                <Box
                  ref={sliderRef}
                  className="keen-slider"
                  w="100%"
                  overflow="hidden"
                  borderRadius="xl"
                >
                  <Box className="keen-slider__slide">
                    <HeroCard
                      featuredSessions={featuredSessions}
                      isLoading={isLoadingFeaturedSessions}
                      onOpenSessionDetail={handlers.openSessionDetailModal}
                    />
                  </Box>
                  <Box className="keen-slider__slide">
                    <GrowthStats />
                  </Box>
                </Box>

                {/* Slider Dots */}
                <HStack justify="center" mt={4} gap={2}>
                  {[0, 1].map((i) => (
                    <Box
                      key={i}
                      h="8px"
                      w={currentSlide === i ? "24px" : "8px"}
                      bg={currentSlide === i ? "teal.500" : "gray.300"}
                      _dark={{
                        bg: currentSlide === i ? "teal.400" : "gray.600"
                      }}
                      borderRadius="full"
                      cursor="pointer"
                      onClick={() => sliderInstanceRef.current?.moveToIdx(i)}
                      transition="all 0.3s"
                    />
                  ))}
                </HStack>
              </Box>
            ) : (
              // SSR: Show only HeroCard
              <Box borderRadius="xl">
                <HeroCard
                  featuredSessions={featuredSessions}
                  isLoading={isLoadingFeaturedSessions}
                  onOpenSessionDetail={handlers.openSessionDetailModal}
                />
              </Box>
            )}

            {/* Featured Mentors */}
            <Box>
              <FeaturedMentors
                featuredMentors={featuredMentors || []}
                isLoading={isLoadingFeaturedMentors}
              />
            </Box>

            {/* Top Mentors */}
            <Box>
              <TopMentors />
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
              <HeroCard
                featuredSessions={featuredSessions}
                isLoading={isLoadingFeaturedSessions}
                onOpenSessionDetail={handlers.openSessionDetailModal}
              />
              <FeaturedMentors
                featuredMentors={featuredMentors || []}
                isLoading={isLoadingFeaturedMentors}
              />
            </VStack>

            {/* Right Column - Sidebar (1/3 width) */}
            <VStack gap={6} align="stretch">
              <GrowthStats />
              <Box position="sticky" top="80px">
                <TopMentors />
              </Box>
            </VStack>
          </SimpleGrid>
        </Box>
      </Box>

      {/* Session Detail Modal */}
      <SessionDetailModal
        session={selectedSessionFromUrl || null}
        isOpen={!!search.sessionDetailId}
        onClose={handlers.closeSessionDetailModal}
      />
    </>
  );
};

export default Home;