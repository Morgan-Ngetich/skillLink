import { Box, Flex, VStack, Container, Heading, Tabs } from "@chakra-ui/react"
import { useBreakpointValue } from "@chakra-ui/react"
import { LuActivity, LuCalendar, LuClock4 } from "react-icons/lu"
import { useRouter, useSearch } from "@tanstack/react-router"

import { useAuthRouteGuard } from "@/hooks/auth/useAuthRouteGuard"
import { useProfile } from "@/hooks/useProfile"
import { useAuth } from "@/hooks/auth/useAuth"

import ProfileCard from "@/components/dashboard/menteeProfile/menteeProfileCard/Index"
import ProfileEditModal from "@/components/dashboard/menteeProfile/menteeProfileCard/editProfileCard/ProfileEditModal"
import ProfileCompletionCard from "@/components/dashboard/menteeProfile/menteeProfileCard/ProfileCardCompletion"
import MentorProfileSetupModal from "@/components/dashboard/mentorProfile/mentorProfileSetup/MentorProfileSetupModal"
import BecomeMentorButton from "@/components/dashboard/mentorProfile/mentorProfileSetup/BecomeMentorButton"
import PeopleAlsoViewed from "@/components/homepage/TopMentors"
import HeroCard from "@/components/homepage/herocard/HeroCard"
import MentorshipCalendarContent from "@/components/dashboard/menteeProfile/calendar/MentorshipCalendarContent "

const ProfilePage = () => {
  const { isBlocked, isLoading } = useAuthRouteGuard()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const { profile } = useProfile()
  const { user } = useAuth()
  const router = useRouter()
  const search = useSearch({ from: "/_layout/dashboard/profile" })

  // ========== MODAL HANDLERS ==========
  
  const openModal = (drawer: string, step?: string) => {
    router.navigate({
      to: "/dashboard/profile",
      search: { drawer, step },
      replace: false,
    })
  }

  const closeModal = () => {
    router.navigate({
      to: "/dashboard/profile",
      search: {},
      replace: true,
    })
  }

  // ========== LOADING STATE ==========
  
  if (isLoading || isBlocked) return null

  // ========== SIDEBAR CONTENT ==========
  
  const SidebarTabs = () => {
    const tabs = [
      {
        value: 'activity',
        label: 'Activity',
        icon: LuActivity,
        content: (
          <>
            {!profile?.is_profile_complete && (
              <ProfileCompletionCard onEditProfile={() => openModal('setup-profile', 'basic')} />
            )}
            {!user?.is_mentor && <BecomeMentorButton />}
          </>
        )
      },
      {
        value: 'sessions',
        label: 'Sessions',
        icon: LuClock4,
        content: <HeroCard variant="card" />
      },
      {
        value: 'availability',
        label: 'Availability',
        icon: LuCalendar,
        content: <MentorshipCalendarContent />
      },
    ]

    return (
      <Tabs.Root defaultValue="activity" variant="enclosed" w="full">
        <Tabs.List justifyContent="space-between" w="full">
          {tabs.map(({ value, label, icon: Icon }) => (
            <Tabs.Trigger
              key={value}
              value={value}
              flex="1"
              justifyContent="center"
              fontWeight="medium"
            >
              <Icon size={16} />
              {label}
            </Tabs.Trigger>
          ))}
          <Tabs.Indicator />
        </Tabs.List>

        {tabs.map(({ value, content }) => (
          <Tabs.Content key={value} value={value} pt={4}>
            <Heading size="sm" mb={4}>
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </Heading>
            {content}
          </Tabs.Content>
        ))}
      </Tabs.Root>
    )
  }

  // ========== MOBILE SIDEBAR ==========
  
  const MobileSidebar = () => (
    <VStack w="full" gap={6}>
      {!profile?.is_profile_complete && (
        <ProfileCompletionCard onEditProfile={() => openModal('setup-profile', 'basic')} />
      )}
      {/* {!user?.is_mentor && <BecomeMentorButton />} */}
      <PeopleAlsoViewed />
    </VStack>
  )

  // ========== DESKTOP SIDEBAR ==========
  
  const DesktopSidebar = () => (
    <VStack gap={6} align="start" flex="0 0 36%" w="36%">
      <SidebarTabs />
      <PeopleAlsoViewed />
    </VStack>
  )

  // ========== RENDER ==========

  return (
    <>
      {/* Modals */}
      <ProfileEditModal
        isOpen={search.drawer === "setup-profile"}
        onClose={closeModal}
        initialStep={search.step || "basic"}
      />

      <MentorProfileSetupModal
        isOpen={search.drawer === "mentor-setup"}
        onClose={closeModal}
      />

      {/* Main Content */}
      <Container h="full" p={{ base: 2, md: 5 }} maxW="breakpoint-xl">
        <Flex
          justify="space-between"
          gap={5}
          direction={{ base: "column", md: "row" }}
        >
          {/* Profile Card */}
          <Box flex={{ base: "none", lg: "0 0 60%" }} w={{ base: "100%", lg: "60%" }}>
            <ProfileCard
              user={user || undefined}
              profile={profile}
              onEditClick={() => openModal('setup-profile', 'basic')}
              activeTab="about"
            />
          </Box>

          {/* Sidebar */}
          {isMobile ? <MobileSidebar /> : <DesktopSidebar />}
        </Flex>
      </Container>
    </>
  )
}

export default ProfilePage