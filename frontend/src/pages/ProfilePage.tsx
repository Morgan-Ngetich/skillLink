import { ProfilePerformanceCard } from "@/components/dashboard/menteeProfile/analytics/ProfilePerformanceCard"
import MenteeProfileCard from "@/components/dashboard/menteeProfile/MenteeProfileCard"
import { MentorFeedbackCard } from "@/components/dashboard/menteeProfile/MentorFeedbackCard"
import YourMentors from "@/components/dashboard/mentorProfile/YourMentors"
import { useAuthRouteGuard } from "@/hooks/auth/useAuthRouteGuard"
import { Box, Flex, VStack } from "@chakra-ui/react"

const ProfilePage = () => {
  const { isBlocked, isLoading } = useAuthRouteGuard()

  if (isLoading || isBlocked) {
    // TODO: return the page's skeleton structure.
    return null
  }

  return (
    <Box w="100%" h="100vh" px={2} overflow="hidden" scrollbar={'hidden'}>
      <Flex h="100%" >
        {/* Scrollable Left Panel */}
        <Box
          h="100%"
          overflowY="auto"
        >
          <MenteeProfileCard />
        </Box>

        {/* Right Panel Stays Fixed */}
        <Box flex="1" position="sticky" top="0" h="100vh" overflow="auto">
          <VStack gap={5} align="stretch" p={2}>
            <ProfilePerformanceCard />
            <MentorFeedbackCard />
            <YourMentors />
          </VStack>
        </Box>

      </Flex>
    </Box>

  )
}

export default ProfilePage
