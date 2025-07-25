import { Box, Flex, VStack } from "@chakra-ui/react"
import GoalsProjectsTracker from "@/components/dashboard/menteeProfile/GoalsProjectsTracker/Index"
import YourMentors from "@/components/dashboard/mentorProfile/YourMentors"
import { MentorFeedbackCard } from "@/components/dashboard/menteeProfile/MentorFeedbackCard"
import MentorshipTimeline from "@/components/dashboard/mentorProfile/MentorshipTimeline"

const HomeMenteeDashboard = () => {
  return (
    <Box w="100%" h="100vh" px={2} overflow="hidden" scrollbar={'hidden'}>
      <Flex h="100%" >
        {/* Scrollable Left Panel */}
        <Box
          h="100%"
          overflowY="auto"
          w={'55%'}
        >
          <GoalsProjectsTracker />
          <MentorshipTimeline />
        </Box>

        {/* Right Panel Stays Fixed */}
        <Box flex="1" position="sticky" top="0" h="100vh" overflow="auto">
          <VStack gap={5} align="stretch" pl={2}>
            <YourMentors />
            <MentorFeedbackCard />
          </VStack>
        </Box>

      </Flex>
    </Box>
  )
}

export default HomeMenteeDashboard