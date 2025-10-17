import { Container, Flex, Box, VStack, Heading, useBreakpointValue } from "@chakra-ui/react"
import ProfileCard from "@/components/dashboard/menteeProfile/menteeProfileCard/Index";
import HeroCard from "@/components/homepage/herocard/HeroCard";
import MentorshipCalendarContent from "@/components/dashboard/menteeProfile/calendar/MentorshipCalendarContent ";
import PeopleAlsoViewed from "@/components/homepage/TopMentors";
import { useAuth } from "@/hooks/auth/useAuth";

const MentorPage = () => {
  const onEditClick = () => {
    console.log('Edit button clicked');
    // Add edit logic here
  };

  const { user } = useAuth()

  const isMobile = useBreakpointValue({ base: true, md: false })

  return (
    <Container h="full" p={{ base: 2, md: 5 }} maxW="breakpoint-xl">
      <Flex
        justify="space-between"
        gap={5}
        direction={{ base: "column", md: "row" }}
      >
        {/* LEFT SIDE */}
        <Box
          flex={{ base: "none", lg: "0 0 60%" }}  // 60% width on lg+
          w={{ base: "100%", lg: "60%" }}
        >
          <Flex mx="auto" mb={8}>
            <ProfileCard
              user={user || undefined}
              onEditClick={onEditClick}
              activeTab="about"
            />
          </Flex>
        </Box>

        {/* RIGHT SIDE */}
        {isMobile ? (
          <VStack>
            <Box w="full">
              <PeopleAlsoViewed />
            </Box>
          </VStack>
        ) : (
          <VStack
            gap={6}
            align="start"
            flex={{ base: "none", lg: "0 0 36%" }}  // 40% width on lg+
            w={{ base: "100%", lg: "36%" }}
          >
            <VStack align="start" w="full">
              <Heading>Upcoming Sessions</Heading>
              <HeroCard variant="card" />
            </VStack>

            <VStack align="start" w="full">
              <Heading>Availability</Heading>
              <MentorshipCalendarContent />
            </VStack>

            <VStack align="start" w="full">
              <PeopleAlsoViewed />
            </VStack>
          </VStack>
        )}
      </Flex>
    </Container>

  );
};

export default MentorPage;