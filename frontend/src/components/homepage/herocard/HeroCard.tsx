import { Box, Flex, useBreakpointValue } from '@chakra-ui/react';
import { useState } from 'react';
import type { MentorSessionPublic } from '@/client';
import { useUserById } from '@/hooks/public/useProfile';
import MentorSessionInfo from './MentorSessionInfo';
import InfoPanelContent from './InfoPanelContent';
import HeroCardSkeleton from './HeroCardSkeleton';

interface HeroCardProps {
  featuredSessions?: MentorSessionPublic[];
  isLoading?: boolean;
  variant?: 'responsive' | 'card';
  // TODO: Consider to use this func if you want the SessionDetailsModal to show up on the homepage.
  onOpenSessionDetail?: (sessionId: string) => void
}

const HeroCard = ({ featuredSessions = [], isLoading, variant = 'responsive' }: HeroCardProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentFeaturedSession = featuredSessions[currentIndex];

  // Get confirmed bookings
  const confirmedBookings =
    currentFeaturedSession?.bookings?.filter((b) => b.status === "confirmed") || [];

  // Fetch mentor data
  const { data: mentorData, isLoading: mentorLoading } = useUserById(
    currentFeaturedSession?.mentor_id || 0
  );

  const isMobile = useBreakpointValue({ base: true, md: false });
  const isMobileLayout = variant === 'card' || isMobile;

  // Handle loading and empty states
  if (isLoading || mentorLoading || !featuredSessions || featuredSessions.length === 0) {
    return (
      <HeroCardSkeleton />
    );
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredSessions.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredSessions.length) % featuredSessions.length);
  };

  return (
    <Flex
      direction={isMobileLayout ? 'column' : { base: 'column', md: 'row' }}
      w="full"
      maxW={"1200px"}
      minH={{ base: "auto", md: "21em" }}
      h="auto"
      rounded="xl"
      shadow="md"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.200"
    >
      {/* Mentor Session Card - Left Side */}
      <Box
        flex={1}
        minW={0}
      >
        <MentorSessionInfo
          session={currentFeaturedSession}
          confirmedBookings={confirmedBookings}
          mentorData={mentorData}
          onPrevious={handlePrevious}
          onNext={handleNext}
          currentIndex={currentIndex}
          totalSlides={featuredSessions.length}
          isMobileLayout={isMobileLayout}
        />
      </Box>

      {/* Desktop Info Panel - Right Side */}
      <Box
        flex={1} minW={0} display={{ base: 'none', md: 'block' }}
      >
        <InfoPanelContent
          session={currentFeaturedSession}
          mentorData={mentorData}
          confirmedBookings={confirmedBookings}
          isMobileLayout={isMobileLayout}
        />
      </Box>
    </Flex>
  );
};

export default HeroCard;