import {
  Box,
  Flex,
  Separator,
  Tabs,
  useBreakpointValue,
  Text,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { LuUser, LuStar, LuActivity, LuCalendarArrowUp, LuThumbsUp, LuThumbsDown } from "react-icons/lu";
import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';
import SkillsOrInterests from './SkillsOrInterests';
import UserProfileBanner from './UserProfileBanner';
import MentorshipCalendarContent from '../calendar/MentorshipCalendarContent ';
import { Avatar } from '@/components/ui';
import { FaCalendar } from 'react-icons/fa6';
import type { UserProfilePublic, UserPublic } from '@/client';
// import ProfileCompletionCard from './ProfileCardCompletion';



interface ProfileCardProps {
  user?: UserPublic;
  profile?: UserProfilePublic;
  onEditClick?: () => void;
  activeTab?: string;
}

export default function ProfileCard({
  user,
  profile,
  onEditClick,
  activeTab = 'about',
}: ProfileCardProps) {
  const isMobile = useBreakpointValue({ base: true, md: false })
  // const sessions = true
  // Guard clause - return null or loading state if user is undefined
  if (!user) {
    return (
      <Box
        borderRadius="lg"
        overflow="hidden"
        boxShadow="lg"
        maxW="3xl"
        minW="3xl"
        border="1px solid"
        p={6}
      >
        <p>Loading profile..</p>
      </Box>
    );
  }

  console.log(profile)

  const handleEdit = () => {
    // console.log(`Edit ${userType} profile clicked`);
    onEditClick?.();
  };


  const renderSeparatorSection = (Component: React.ElementType, props = {}) => (
    <>
      <Component {...props} />
      <Separator my={4} />
    </>
  );

  const renderAboutContent = () => (
    <Box>
      {profile?.experience && renderSeparatorSection(ExperienceSection, { experience: profile?.experience })}
      {profile?.education && renderSeparatorSection(EducationSection, { education: profile?.education })}
      {profile?.skills && renderSeparatorSection(SkillsOrInterests, { skillsOrinterests: profile?.skills, section: "skillsSection" })}
      {profile?.interests && renderSeparatorSection(SkillsOrInterests, { skillsOrinterests: profile?.interests })}
    </Box>
  );

  const renderReviewsContent = () => (
    <Box>
      <Text fontWeight="bold" fontSize="lg" mb={6}>
        Reviews from {user.is_mentor ? 'Mentees' : 'Mentors'}
      </Text>

      {[
        {
          name: "Grace Wanjiru",
          role: "UI/UX Designer",
          time: "2 weeks ago",
          stars: 5,
          text: `Incredible mentor! The guidance helped me land my first design role.
        Patient, knowledgeable, and genuinely cares about growth. Highly recommend!`,
          avatar: "https://randomuser.me/api/portraits/women/65.jpg"
        },
        {
          name: "James Mwangi",
          role: "Product Designer",
          time: "1 month ago",
          stars: 4,
          text: `Outstanding expertise in design systems and product strategy.
        Feedback was constructive and actionable. Great mentor for anyone serious about product design!`,
          avatar: "https://randomuser.me/api/portraits/men/75.jpg"
        },
        {
          name: "Sarah Njeri",
          role: "UX Researcher",
          time: "2 months ago",
          stars: 5,
          text: `Working together transformed my approach to UX research.
        Learned how to think like a product designer and communicate research findings effectively. Amazing experience!`,
          avatar: "https://randomuser.me/api/portraits/women/90.jpg"
        }
      ].map((review, i) => (
        <Box
          key={i}
          pb={6}
          mb={6}
          borderBottom="1px solid"
          borderColor="fg.muted"
          _last={{ borderBottom: "none", mb: 0, pb: 0 }}
        >
          <Flex align="flex-start" direction={"column"} gap={1}>
            <HStack align={'flex-start'}>

              <Avatar
                src={review.avatar}
                name={review.name}
              />

              <Flex justify="space-between" align="start" direction={"column"}>
                <Box>
                  <Text fontWeight="semibold" fontSize="sm">
                    {review.name}
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    {review.role} • {review.time}
                  </Text>
                </Box>
                <HStack gap={1} mt={1} mb={2}>
                  {[...Array(5)].map((_, idx) => (
                    <LuStar
                      key={idx}
                      size={14}
                      fill={idx < review.stars ? "orange" : "transparent"}
                      color="orange"
                    />
                  ))}
                </HStack>
              </Flex>

            </HStack>


            <Box>
              <Box ml={{ base: 0, lg: 10 }}>
                <Text fontSize="sm" color="fg.muted" lineHeight="1.5">
                  {review.text}
                </Text>
              </Box>

              <HStack mt={2} gap={4} fontSize="sm" color="fg.muted">
                <HStack gap={0}>
                  <IconButton
                    aria-label="Like"
                    variant="ghost"
                    size="xs"
                  // color="gray.600"
                  >
                    <LuThumbsUp />
                  </IconButton>
                  <Text fontSize="xs">12</Text>
                </HStack>

                <HStack gap={1}>
                  <IconButton
                    aria-label="Dislike"
                    variant="ghost"
                    size="xs"
                  // color="gray.600"
                  >
                    <LuThumbsDown />
                  </IconButton>
                </HStack>
              </HStack>
            </Box>
          </Flex>
        </Box>
      ))}
    </Box>
  );

  const renderActivityContent = () => (
    <Box>
      <Box fontWeight="bold" fontSize="lg" mb={4}>Recent Activity</Box>

      <Box>
        {/* Completed mentoring session */}
        <Flex gap={4} mb={6}>
          <Box
            w="2"
            bg="blue.500"
            borderRadius="full"
            flexShrink={0}
          />
          <Box flex={1}>
            <Box fontWeight="semibold" mb={1}>Completed mentorship session</Box>
            <Box color="gray.600" fontSize="sm" mb={1}>
              Had a great session with Sarah discussing portfolio optimization
            </Box>
            <Box color="gray.500" fontSize="xs">3 days ago</Box>
          </Box>
        </Flex>

        {/* Received review from mentee */}
        <Flex gap={4} mb={6}>
          <Box
            w="2"
            bg="green.500"
            borderRadius="full"
            flexShrink={0}
          />
          <Box flex={1}>
            <Box fontWeight="semibold" mb={1}>Received 5-star review</Box>
            <Box color="gray.600" fontSize="sm" mb={1}>
              "Amazing mentor! Really helped me land my dream job" - John D.
            </Box>
            <Box color="gray.500" fontSize="xs">1 week ago</Box>
          </Box>
        </Flex>

        {/* Updated mentor profile */}
        <Flex gap={4} mb={6}>
          <Box
            w="2"
            bg="purple.500"
            borderRadius="full"
            flexShrink={0}
          />
          <Box flex={1}>
            <Box fontWeight="semibold" mb={1}>Updated profile skills</Box>
            <Box color="gray.600" fontSize="sm" mb={1}>
              Added new expertise: Design Thinking, Team Leadership
            </Box>
            <Box color="gray.500" fontSize="xs">2 weeks ago</Box>
          </Box>
        </Flex>

        {/* Accepted new mentee */}
        <Flex gap={4}>
          <Box
            w="2"
            bg="orange.500"
            borderRadius="full"
            flexShrink={0}
          />
          <Box flex={1}>
            <Box fontWeight="semibold" mb={1}>Accepted new mentee</Box>
            <Box color="gray.600" fontSize="sm" mb={1}>
              Started guiding Emma in UX Research fundamentals
            </Box>
            <Box color="gray.500" fontSize="xs">3 weeks ago</Box>
          </Box>
        </Flex>
      </Box>
    </Box>
  );

  // Render content with tabs for mentors, without tabs for mentees
  const renderContent = () => {
    if (user.is_mentor) {
      return (
        <Tabs.Root defaultValue={activeTab} w="full">
          <Box overflowX="auto" whiteSpace="nowrap" scrollbar="hidden">
            <Tabs.List display="flex" w="max-content" minW="100%">
              <Tabs.Trigger value="about">
                <LuUser />
                About
              </Tabs.Trigger>

              <Tabs.Trigger value="availability">
                <LuCalendarArrowUp />
                Availability
              </Tabs.Trigger>

              <Tabs.Trigger value="reviews">
                <LuStar />
                Reviews
              </Tabs.Trigger>

              <Tabs.Trigger value="activity">
                <LuActivity />
                Activity
              </Tabs.Trigger>

              <Tabs.Indicator />
            </Tabs.List>
          </Box>

          <Box mt={4}>
            <Tabs.Content value="about">{renderAboutContent()}</Tabs.Content>
            <Tabs.Content value="availability">
              <MentorshipCalendarContent />
            </Tabs.Content>
            <Tabs.Content value="reviews">{renderReviewsContent()}</Tabs.Content>
            <Tabs.Content value="activity">{renderActivityContent()}</Tabs.Content>
          </Box>
        </Tabs.Root>
      );
    }

    // mentee layout
    if (user.is_mentee && isMobile) {
      return (
        <Tabs.Root defaultValue={activeTab} w="full">
          <Box overflowX="auto" whiteSpace="nowrap" scrollbar="hidden">
            <Tabs.List display="flex" w="max-content" minW="100%">
              <Tabs.Trigger value="about">
                <LuUser />
                About
              </Tabs.Trigger>

              <Tabs.Trigger value="calendar">
                <FaCalendar />
                Calendar
              </Tabs.Trigger>

              <Tabs.Trigger value="activity">
                <LuActivity />
                Activity
              </Tabs.Trigger>

              <Tabs.Indicator />
            </Tabs.List>
          </Box>

          <Box mt={4}>
            <Tabs.Content value="about">{renderAboutContent()}</Tabs.Content>
            <Tabs.Content value="calendar">
              <MentorshipCalendarContent />
            </Tabs.Content>
            <Tabs.Content value="activity">{renderActivityContent()}</Tabs.Content>
          </Box>
        </Tabs.Root>
      );
    }

    // fallback (if userType is undefined)
    return renderAboutContent();
  };



  return (
    <Box
      borderRadius="lg"
      overflow="hidden"
      boxShadow={{ base: "none", md: "sm" }}
      w="full"
      border={{ base: "none", md: "1px solid" }}
      borderColor={"gray.muted"}
    >
      {/* Banner Section - Same for both */}

      <UserProfileBanner
        user={user}
        profile={profile}
        onEditClick={handleEdit}
      />

      {/* Content Section */}
      <Box px={{ base: 0, md: 6 }} pt={{ base: 3, md: 5 }} pb={3}>
        <Flex direction="column" gap={4} position="relative" >
          {/* 
          {profile && (
            <Box mx="auto" w={{ base: "100%", md: "80%" }}>
              <ProfileCompletionCard onEditProfile={handleEdit} />
            </Box>
          )} */}
          {!isMobile && <Separator />}
          {renderContent()}

        </Flex>

      </Box>
    </Box>
  );
}