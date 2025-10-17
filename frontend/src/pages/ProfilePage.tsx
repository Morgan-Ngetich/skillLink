import MentorshipCalendarContent from "@/components/dashboard/menteeProfile/calendar/MentorshipCalendarContent "

import { useAuthRouteGuard } from "@/hooks/auth/useAuthRouteGuard"
import { Box, Flex, VStack, Container, Heading } from "@chakra-ui/react"
import { useBreakpointValue } from "@chakra-ui/react"
import ProfileCard from "@/components/dashboard/menteeProfile/menteeProfileCard/Index"
import PeopleAlsoViewed from "@/components/homepage/TopMentors"
import HeroCard from "@/components/homepage/herocard/HeroCard"
import { useProfile } from "@/hooks/useProfile"
import { useAuth } from "@/hooks/auth/useAuth"
import { useState } from "react"
import ProfileEditModal from "@/components/dashboard/menteeProfile/menteeProfileCard/editProfileCard/ProfileEditModal"
import ProfileCompletionCard from "@/components/dashboard/menteeProfile/menteeProfileCard/ProfileCardCompletion"

const ProfilePage = () => {
  const { isBlocked, isLoading } = useAuthRouteGuard()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const isMobile = useBreakpointValue({ base: true, md: false })
  const { profile } = useProfile()
  const { user } = useAuth()

  if (isLoading || isBlocked) {
    // TODO: return the page's skeleton structure.
    return null
  }

  const onEditClick = () => {
    console.log('Edit button clicked');
    setIsEditModalOpen(true);
  }

  
  return (
    <>
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

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
            <Flex mx="auto">
              <ProfileCard
                user={user || undefined}
                profile={profile}
                onEditClick={onEditClick}
                activeTab="about"
              />
            </Flex>
          </Box>

          {/* RIGHT SIDE */}
          {isMobile ? (
            <VStack>
              <VStack w="full" gap={6}>
                {!profile?.is_profile_complete && (
                  <ProfileCompletionCard onEditProfile={onEditClick} />
                )}
                <PeopleAlsoViewed />
              </VStack>
            </VStack>
          ) : (
            <VStack
              gap={6}
              align="start"
              flex={{ base: "none", lg: "0 0 36%" }}  // 40% width on lg+
              w={{ base: "100%", lg: "36%" }}
            >
              {!profile?.is_profile_complete && (
                <VStack align="start" w="full">
                  <ProfileCompletionCard onEditProfile={onEditClick} />
                </VStack>
              )}

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
    </>
  )
}

export default ProfilePage
