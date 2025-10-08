import { ProfilePerformanceCard } from "@/components/dashboard/menteeProfile/analytics/ProfilePerformanceCard"
// import { MentorshipCalendar } from "@/components/dashboard/menteeProfile/calendar/MentorshipCalendar"
import MentorshipCalendarContent from "@/components/dashboard/menteeProfile/calendar/MentorshipCalendarContent "
import MenteeProfileCard from "@/components/dashboard/menteeProfile/menteeProfileCard/Index"
import { MentorFeedbackCard } from "@/components/dashboard/menteeProfile/MentorFeedbackCard"
// import MentorshipTimeline from "@/components/dashboard/mentorProfile/MentorshipTimeline"
// import YourMentors from "@/components/dashboard/mentorProfile/YourMentors"
import { useAuthRouteGuard } from "@/hooks/auth/useAuthRouteGuard"
import { Box, Flex, VStack, Container, Tabs } from "@chakra-ui/react"
import { FaCalendar, FaFolder } from "react-icons/fa6"

const ProfilePage = () => {
  const { isBlocked, isLoading } = useAuthRouteGuard()

  if (isLoading || isBlocked) {
    // TODO: return the page's skeleton structure.
    return null
  }

  return (
    <Container w="100%" h="full" p={4}>
      <Flex h="100%" gap={5}>
        {/* Left Panel: Scrollable */}
        <Box
          // w="320px" // or any fixed width you want
          h="100%"
          overflowY="auto"
          pr={2}
          pb={4}
        >
          <VStack gap={5} align="stretch">
            <MenteeProfileCard />
            {/* <MentorshipTimeline /> */}
          </VStack>
        </Box>

        {/* Right Panel: Also Scrollable */}
        <Box
          flex="1"
          h="100%"
          overflowY="auto"
          pr={2}
          // scrollbar={"hidden"}
        >
          <VStack gap={2} align="stretch">
            <ProfilePerformanceCard />
            <Tabs.Root defaultValue="calendar" variant={'enclosed'}>
              <Tabs.List>
                <Tabs.Trigger value="calendar">
                  <FaCalendar style={{ marginRight: 6 }} />
                  Calendar
                </Tabs.Trigger>
                <Tabs.Trigger value="feedback">
                  <FaFolder style={{ marginRight: 6 }} />
                  Feedback
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="feedback">
                <MentorFeedbackCard />
              </Tabs.Content>

              <Tabs.Content value="calendar">
                <MentorshipCalendarContent />
              </Tabs.Content>
            </Tabs.Root>
          </VStack>
        </Box>
      </Flex>
    </Container>
  )
}

export default ProfilePage
