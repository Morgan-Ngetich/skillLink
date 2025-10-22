import {
  Box,
  Separator,
  Tabs,
  Text,
  HStack,
  IconButton,
  useBreakpointValue,
} from '@chakra-ui/react';
import { LuUser, LuStar, LuActivity, LuCalendar, LuThumbsUp, LuThumbsDown } from "react-icons/lu";
import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';
import SkillsOrInterests from './SkillsOrInterests';
import UserProfileBanner from './UserProfileBanner';
import Goals from './Goals';
import MentorshipCalendarContent from '../calendar/MentorshipCalendarContent ';
import { Avatar } from '@/components/ui';
import type { UserProfilePublic, UserPublic } from '@/client';
import About from './About';
import BecomeMentorButton from '../../mentorProfile/mentorProfileSetup/BecomeMentorButton';

interface ProfileCardProps {
  user?: UserPublic;
  profile?: UserProfilePublic;
  onEditClick?: () => void;
  activeTab?: string;
}

// Mock review data (move to API later)
const MOCK_REVIEWS = [
  {
    name: "Grace Wanjiru",
    role: "UI/UX Designer",
    time: "2 weeks ago",
    stars: 5,
    text: "Incredible mentor! The guidance helped me land my first design role. Patient, knowledgeable, and genuinely cares about growth.",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg"
  },
  {
    name: "James Mwangi",
    role: "Product Designer",
    time: "1 month ago",
    stars: 4,
    text: "Outstanding expertise in design systems and product strategy. Feedback was constructive and actionable.",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg"
  },
  {
    name: "Sarah Njeri",
    role: "UX Researcher",
    time: "2 months ago",
    stars: 5,
    text: "Working together transformed my approach to UX research. Learned how to think like a product designer.",
    avatar: "https://randomuser.me/api/portraits/women/90.jpg"
  }
];

export default function ProfileCard({
  user,
  profile,
  onEditClick,
  activeTab = 'about',
}: ProfileCardProps) {


  const isMobile = useBreakpointValue({ base: true, md: false })

  if (!user) {
    return (
      <Box borderRadius="lg" boxShadow="lg" border="1px solid" p={6}>
        <Text>Loading profile...</Text>
      </Box>
    );
  }

  // ========== RENDER HELPERS ==========

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Section = ({ Component, ...props }: any) => (
    <>
      <Component {...props} />
      <Separator my={4} />
    </>
  );

  // ========== TAB CONTENT ==========

  const AboutTab = () => (
    <Box>
      {profile?.about && <Section Component={About} about={profile.about} />}
      {profile?.experience && <Section Component={ExperienceSection} experience={profile.experience} />}
      {profile?.education && <Section Component={EducationSection} education={profile.education} />}
      {profile?.goals && <Section Component={Goals} goals={profile.goals} />}
      {profile?.skills && <Section Component={SkillsOrInterests} skillsOrinterests={profile.skills} section="skillsSection" />}
      {profile?.interests && <Section Component={SkillsOrInterests} skillsOrinterests={profile.interests} />}
    </Box>
  );

  const CalendarTab = () => <MentorshipCalendarContent />;

  const ReviewsTab = () => (
    <Box px={{ base: 3, md: 0 }}>
      <Text fontWeight="bold" fontSize="lg" mb={6}>
        Reviews from {user.is_mentor ? 'Mentees' : 'Mentors'}
      </Text>

      {MOCK_REVIEWS.map((review, i) => (
        <Box
          key={i}
          pb={6}
          mb={6}
          borderBottom="1px solid"
          borderColor="border.subtle"
          _last={{ borderBottom: "none", mb: 0, pb: 0 }}
        >
          <HStack align="flex-start" gap={3} mb={3}>
            <Avatar src={review.avatar} name={review.name} />

            <Box flex={1}>
              <Text fontWeight="semibold" fontSize="sm">{review.name}</Text>
              <Text fontSize="xs" color="fg.muted">
                {review.role} • {review.time}
              </Text>

              <HStack gap={1} mt={1}>
                {[...Array(5)].map((_, idx) => (
                  <LuStar
                    key={idx}
                    size={14}
                    fill={idx < review.stars ? "orange" : "transparent"}
                    color="orange"
                  />
                ))}
              </HStack>
            </Box>
          </HStack>

          <Text fontSize="sm" color="fg.muted" lineHeight="1.6" mb={2}>
            {review.text}
          </Text>

          <HStack gap={4} fontSize="sm" color="fg.muted">
            <HStack gap={1}>
              <IconButton aria-label="Like" variant="ghost" size="xs">
                <LuThumbsUp />
              </IconButton>
              <Text fontSize="xs">12</Text>
            </HStack>
            <IconButton aria-label="Dislike" variant="ghost" size="xs">
              <LuThumbsDown />
            </IconButton>
          </HStack>
        </Box>
      ))}
    </Box>
  );

  const ActivityTab = () => (
    <Box>
      <Text fontWeight="bold" fontSize="lg" mb={4}>Recent Activity</Text>
      {!user.is_mentor && <BecomeMentorButton />}
    </Box>
  );

  // ========== TAB CONFIGURATION ==========

  const tabs = [
    { value: 'about', label: 'About', icon: LuUser, content: <AboutTab /> },
    { value: 'calendar', label: 'Calendar', icon: LuCalendar, content: <CalendarTab />, showIf: isMobile },
    { value: 'reviews', label: 'Reviews', icon: LuStar, content: <ReviewsTab />, showIf: user.is_mentor },
    { value: 'activity', label: 'Activity', icon: LuActivity, content: <ActivityTab /> },
  ].filter(tab => tab.showIf !== false);

  // ========== RENDER ==========

  return (
    <Box
      borderRadius="lg"
      overflow="hidden"
      boxShadow={{ base: "none", md: "sm" }}
      w="full"
      border={{ base: "none", md: "1px solid" }}
      borderColor="border.subtle"
    >
      <UserProfileBanner
        user={user}
        profile={profile}
        onEditClick={onEditClick}
      />

      <Box px={{ base: 0, md: 6 }} pt={{ base: 3, md: 5 }} pb={3}>
        <Separator display={{ base: 'none', md: 'block' }} mb={4} />

        <Tabs.Root defaultValue={activeTab} w="full">
          <Box overflowX="auto" whiteSpace="nowrap">
            <Tabs.List display="flex" w="max-content" minW="100%">
              {tabs.map(({ value, label, icon: Icon }) => (
                <Tabs.Trigger key={value} value={value}>
                  <Icon size={16} />
                  {label}
                </Tabs.Trigger>
              ))}
              <Tabs.Indicator />
            </Tabs.List>
          </Box>

          <Box mt={4}>
            {tabs.map(({ value, content }) => (
              <Tabs.Content key={value} value={value}>
                {content}
              </Tabs.Content>
            ))}
          </Box>
        </Tabs.Root>
      </Box>
    </Box>
  );
}