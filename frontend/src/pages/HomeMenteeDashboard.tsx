import { Box, Flex, VStack } from "@chakra-ui/react"
import GoalsProjectsTracker from "@/components/dashboard/menteeProfile/GoalsProjectsTracker/Index"
import YourMentors from "@/components/dashboard/mentorProfile/YourMentors"
import { MentorFeedbackCard } from "@/components/dashboard/menteeProfile/MentorFeedbackCard"
import MentorshipTimeline from "@/components/dashboard/mentorProfile/MentorshipTimeline"
import MenteeDashboardHeader from "@/components/dashboard/menteeProfile/MenteeDashboardHeader"
import ViewCalendar from "@/crackmode/components/calendar/ViewCalendar"
import UserProfileBanner from "@/components/dashboard/menteeProfile/menteeProfileCard/UserProfileBanner"
import MentorshipCalendarContent from "@/components/dashboard/menteeProfile/calendar/MentorshipCalendarContent "
import { ProfilePerformanceCard } from "@/components/dashboard/menteeProfile/analytics/ProfilePerformanceCard"
import MenteeProfileCard from "@/components/dashboard/menteeProfile/menteeProfileCard/Index"

const user = {
  full_name: 'Aisha Kamau',
  role: 'Mentee - Aspiring Product Designer',
  location: 'Nairobi, Kenya',
  avatar_url: 'https://randomuser.me/api/portraits/women/44.jpg',
  education: 'BSc in Information Technology, JKUAT (2020 - 2024)',
  background:
    'Self-taught designer with 1 year of freelance experience in branding and basic web design.',
  interests: ['UX Research', 'Inclusive Design', 'Mobile App Design'],
  preferred_communication: 'Weekly calls, async text updates',
  goals: {
    title: 'Become a UX/UI Designer in 3 months',
    progress: 35,
    summary:
      'Build a portfolio of 3 case studies, apply to 10 job openings, and land a junior role or internship.',
  },
  skills: ['Figma', 'UI Design', 'Wireframing', 'Prototyping', 'HTML', 'Canva'],
  area_of_focus: ['Tech', 'Business', 'Engineering'],
  education_logo:
    'https://upload.wikimedia.org/wikipedia/commons/4/44/Moringa_School_logo.png',
  work_logo: 'https://cdn-icons-png.flaticon.com/512/25/25284.png',
  twitter: 'https://twitter.com/fakeprofile',
  linkedin: 'https://linkedin.com/in/fakeprofile',
  github: 'https://github.com/fakeprofile',
};

const HomeMenteeDashboard = () => {
  return (
    <Box w="100%" px={2} py={4}>
      <Flex
        direction={{ base: "column", md: "row" }}
        align="start"
        // border="1px solid"
      >
        {/* Left Panel */}
        <Box w={{ base: "100%", md: "65%" }}>
          <VStack gap={5} align="stretch">
            {/* <MenteeDashboardHeader /> */}
            <Box border={"1px solid"} borderRadius={"lg"} overflow={"hidden"} maxW={"lg"}>
              <UserProfileBanner user={user} />
              {/* <MenteeProfileCard /> */}
            </Box>
            {/* <GoalsProjectsTracker /> */}
            {/* <YourMentors /> */}
            {/* <MentorshipTimeline /> */}
          </VStack>
        </Box>

        {/* Right Panel */}
        <Box w={"35%"} p={2}>
          <VStack gap={3} align="stretch">
            <ProfilePerformanceCard />
            <MentorshipCalendarContent />
            {/* <YourMentors /> */}
            {/* <MentorFeedbackCard /> */}
          </VStack>
        </Box>
      </Flex>
    </Box>
  )
}

export default HomeMenteeDashboard
