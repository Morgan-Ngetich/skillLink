import { Container, Flex, Box, VStack, Heading, useBreakpointValue } from "@chakra-ui/react"
import ProfileCard, { type UserProfile } from "@/components/dashboard/menteeProfile/menteeProfileCard/Index";
import HeroCard from "@/components/homepage/herocard/HeroCard";
// import ViewCalendar from "@/crackmode/components/calendar/ViewCalendar";
// import MentorshipCalendar  from "@/components/dashboard/menteeProfile/calendar/MentorshipCalendar";
import MentorshipCalendarContent from "@/components/dashboard/menteeProfile/calendar/MentorshipCalendarContent ";
import PeopleAlsoViewed from "@/components/homepage/TopMentors";


// Mentee user data
// const menteeUser: UserProfile = {
//   full_name: 'Aisha Kamau',
//   role: 'Mentee - Aspiring Product Designer',
//   location: 'Nairobi, Kenya',
//   avatar_url: 'https://randomuser.me/api/portraits/women/44.jpg',
//   education: 'BSc in Information Technology, JKUAT (2020 - 2024)',
//   background: 'Self-taught designer with 1 year of freelance experience in branding and basic web design. Passionate about creating accessible and beautiful digital experiences.',
//   interests: ['UX Research', 'Inclusive Design', 'Mobile App Design', 'Design Systems'],
//   preferred_communication: 'Weekly calls, async text updates',
//   goals: {
//     title: 'Become a UX/UI Designer in 3 months',
//     progress: 35,
//     summary: 'Build a portfolio of 3 case studies, apply to 10 job openings, and land a junior role or internship.',
//   },
//   skills: ['Figma', 'UI Design', 'Wireframing', 'Prototyping', 'HTML', 'CSS', 'Canva'],
//   area_of_focus: ['Tech', 'Design', 'User Research'],
//   education_logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Moringa_School_logo.png',
//   work_logo: 'https://cdn-icons-png.flaticon.com/512/25/25284.png',
//   twitter: 'https://twitter.com/aishakamau',
//   linkedin: 'https://linkedin.com/in/aishakamau',
//   github: 'https://github.com/aishakamau',
// };

// Mentor user data
const mentorUser: UserProfile = {
  full_name: 'David Ochieng',
  role: 'Senior Product Designer - Design Lead at SafariTech',
  location: 'Nairobi, Kenya',
  avatar_url: 'https://randomuser.me/api/portraits/men/32.jpg',
  education: 'Master of Design, University of Nairobi (2015 - 2017)',
  background: '8+ years of experience in product design, specializing in fintech and e-commerce. Led design teams at multiple startups and established companies. Passionate about mentoring the next generation of African designers.',
  interests: ['Design Leadership', 'Product Strategy', 'Design Systems', 'Mentorship'],
  preferred_communication: 'Bi-weekly 1-on-1 sessions, Slack for quick questions',
  skills: [
    'Product Design',
    'UX Research',
    'Design Systems',
    'Figma',
    'Sketch',
    'Prototyping',
    'User Testing',
    'Team Leadership',
    'Interaction Design',
    'Design Thinking'
  ],
  area_of_focus: ['Tech', 'Design', 'Product Management', 'Leadership'],
  education_logo: 'https://upload.wikimedia.org/wikipedia/en/5/5f/University_of_Nairobi_logo.png',
  work_logo: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
  twitter: 'https://twitter.com/davidochieng',
  linkedin: 'https://linkedin.com/in/davidochieng',
  github: 'https://github.com/davidochieng',
};

const MentorPage = () => {
  const onEditClick = () => {
    console.log('Edit button clicked');
    // Add edit logic here
  };

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
              user={mentorUser}
              userType="mentor"
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