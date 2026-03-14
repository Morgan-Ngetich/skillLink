import { Box, Flex, Container } from "@chakra-ui/react";
import { useBreakpointValue } from "@chakra-ui/react";
import { useParams, useRouter, useSearch } from "@tanstack/react-router";
import React, { useState, Suspense, lazy, useMemo } from "react";

import { useAuth } from "@/hooks/auth/useAuth";
import { useMentorSessions, useSessionByUuid } from "@/hooks/mentor/useMentorSessions";
import { useUserByUuid } from "@/hooks/public/useProfile";
import { useMentorSettings } from "@/hooks/mentor/useMentorSettings";
import { useProfilePageHandlers } from "@/hooks/public/useProfilePageHandlers";

import type { MentorSessionPublic, MentorServicePublic, UserPublic } from "@/client";

import MenteeSidebarCards from "@/components/profile/profilePage/MenteeSidebarCards";
import DesktopSidebar from "@/components/profile/profilePage/DesktopSidebar";

import ProfileCard from "@/components/dashboard/profileCard/Index";

import { useMentorServices } from "@/hooks/mentor/useMentorServices";
import ProfilePageSkeleton from "@/skeletons/profilPage/Index";
import { useSession } from "@/hooks/auth/useSession";

// Lazy load modals - only needed for owners
const LazyProfileEditModal = lazy(() => import("@/components/dashboard/profileCard/editProfileCard/ProfileEditModal"));
const LazyMentorProfileSetupModal = lazy(() => import("@/components/dashboard/mentor/mentorProfileSetup/MentorProfileSetupModal"));
const LazyMentorSettingsDialog = lazy(() => import("@/components/dashboard/mentor/settings/mentorSettingsDialog.tsx/Index"));
const LazyDeleteSessionDialog = lazy(() => import("@/components/dashboard/mentor/sessions/DeleteSessionDialog"));
const LazyDeleteServiceDialog = lazy(() => import("@/components/dashboard/mentor/services/DeleteServiceDialog"));
const LazySessionDetailModal = lazy(() => import("@/components/dashboard/mentor/sessions/sessionDetails/Index"));

interface ProfilePageProps {
  initialPublicData: UserPublic | null;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ initialPublicData }) => {

  const router = useRouter();
  const search = useSearch({ strict: false });
  const params = useParams({ strict: false });
  const { uuid } = params;

  const isMobile = useBreakpointValue({ base: true, md: false });

  // Auth state - only needed to determine if viewing own profile
  const { user, isLoading: isUserAuthLoading } = useAuth();
  const { cachedUserMetadata } = useSession()

  const isOwnProfile = useMemo(() => {
    // Fallback to runtime calculation (for client-side updates)
    if (cachedUserMetadata?.uuid === uuid) return true
    if (user?.uuid === uuid) return true
    return false
  }, [cachedUserMetadata?.uuid, user?.uuid, uuid])

  // Use Loader data for mentor status if available
  const userIsMentor = useMemo(() => {
    return user?.is_mentor || false
  }, [user?.is_mentor])

  const {
    data: publicUser,
    isLoading: isPublicUserLoading,
    // refetch: refetchPublicUser // Remove if not used
  } = useUserByUuid(uuid, {
    // Use initial data from route loader
    initialData: initialPublicData || undefined,
    enabled: !isUserAuthLoading && !!uuid
  });

  // Determine if we need mentor-specific hooks BEFORE calling them
  const shouldFetchMentorData = isOwnProfile && userIsMentor;

  // Only call mentor hooks when needed
  const mentorSessionsHook = useMentorSessions({ enabled: shouldFetchMentorData });
  const mentorServicesHook = useMentorServices({ enabled: shouldFetchMentorData });
  const mentorSettingsHook = useMentorSettings({ enabled: shouldFetchMentorData });

  // states for session and service deletion dialogs
  const [isDeleteSessionDialogOpen, setIsDeleteSessionDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<MentorSessionPublic | null>(null);
  const [isDeleteServiceDialogOpen, setIsDeleteServiceDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<MentorServicePublic | null>(null);

  const { sessions: freshSessions } = useMentorSessions({ enabled: shouldFetchMentorData });

  // Profile data - memoized to prevent unnecessary recalculations
  const { personalProfile, mentorData } = useMemo(() => {
    if (isOwnProfile) {
      return {
        personalProfile: user?.profile,
        mentorData: user?.profile?.mentor_profile
      };
    } else {
      return {
        personalProfile: publicUser?.profile,
        mentorData: publicUser?.profile?.mentor_profile
      };
    }
  }, [isOwnProfile, user, publicUser]);


  // Settings - memoized
  const { settings, updateSettingsAsync, isUpdating } = useMemo(() => {
    if (shouldFetchMentorData) {
      return {
        settings: mentorSettingsHook.settings,
        updateSettingsAsync: mentorSettingsHook.updateSettingsAsync,
        isUpdating: mentorSettingsHook.isUpdating
      };
    } else {
      return {
        settings: mentorData?.settings,
        updateSettingsAsync: undefined,
        isUpdating: false
      };
    }
  }, [shouldFetchMentorData, mentorSettingsHook, mentorData]);

  const readOnly = !isOwnProfile;

  // Determine if the profile being viewed belongs to a mentor
  const profileUserIsMentor = isOwnProfile
    ? user?.is_mentor
    : publicUser?.is_mentor;

  // All handlers in one custom hook
  const handlers = useProfilePageHandlers({
    router,
    search,
    // Session delete handlers - only pass if we have mentor data
    setIsDeleteSessionDialogOpen,
    sessionToDelete,
    setSessionToDelete,
    deleteSession: shouldFetchMentorData ? mentorSessionsHook.deleteSession : undefined,
    // Service delete handlers - only pass if we have mentor data
    setIsDeleteServiceDialogOpen,
    serviceToDelete,
    setServiceToDelete,
    deleteService: shouldFetchMentorData ? mentorServicesHook.deleteService : undefined,
    // Settings
    updateSettingsAsync,
  });

  // Check if session is in local data first
  // const sessionInLocalData = useMemo(() => {
  //   if (!search.sessionDetailId || !mentorData?.sessions) return null;
  //   return mentorData.sessions.find((s: MentorSessionPublic) => s.uuid === search.sessionDetailId) || null;
  // }, [search.sessionDetailId, mentorData?.sessions]);

  // Fetch from API if not found locally
  const { data: fetchedSession, isLoading: isSessionLoading } = useSessionByUuid(
    search.sessionDetailId || "",
    !!search.sessionDetailId // Only fetch when there's a sessionDetailId
  )

  const selectedSessionFromUrl = fetchedSession || null;

  // Loading state - simplified
  const isLoadingProfile = isUserAuthLoading || (!initialPublicData && isPublicUserLoading);
  const hasRequiredData = isOwnProfile ? !!user : !!publicUser;
  // Show skeleton only if we have NO data at all
  if (isLoadingProfile && !initialPublicData && !publicUser && !personalProfile) {
    return <ProfilePageSkeleton />;
  }

  if (!hasRequiredData) {
    return <ProfilePageSkeleton />;
  }

  // Determine which sidebar to show
  const shouldShowMobileSidebar = isMobile || !profileUserIsMentor;
  const shouldShowDesktopSidebar = !isMobile && profileUserIsMentor;

  return (
    <>
      {/* Lazy-loaded modals for owners only */}
      {isOwnProfile && (
        <Suspense fallback={null}>
          <LazyProfileEditModal
            isOpen={search.drawer === "setup-profile"}
            onClose={handlers.closeModal}
            initialStep={String(search.step || "basic")}
          />

          <LazyMentorProfileSetupModal
            isOpen={search.drawer === "mentor-setup"}
            onClose={handlers.closeModal}
          />

          <LazyMentorSettingsDialog
            isOpen={search.settings === "open"}
            onClose={handlers.handleCloseSettings}
            settings={settings}
            onSave={handlers.handleSaveSettings}
            isUpdating={isUpdating}
          />
        </Suspense>
      )}

      {/* Delete Session Confirmation Dialog */}
      <LazyDeleteSessionDialog
        isOpen={isDeleteSessionDialogOpen}
        session={sessionToDelete}
        onClose={handlers.cancelSessionDelete}
        onConfirm={handlers.confirmSessionDelete}
      />

      {/* Delete Service Confirmation Dialog */}
      <LazyDeleteServiceDialog
        isOpen={isDeleteServiceDialogOpen}
        service={serviceToDelete}
        onClose={handlers.cancelServiceDelete}
        onConfirm={handlers.confirmServiceDelete}
      />

      {/* Session Detail Modal */}
      <LazySessionDetailModal
        session={selectedSessionFromUrl}
        isOpen={!!search.sessionDetailId}
        onClose={handlers.closeSessionDetailModal}
        isLoading={isSessionLoading}
      />

      {/* Main Content */}
      <Container h="full" p={{ base: 2, md: 5 }} maxW="breakpoint-xl">
        <Flex justify="space-between" gap={5} direction={{ base: "column", md: "row" }}>
          <Box flex={{ base: "none", lg: "0 0 60%" }} w={{ base: "100%", lg: "60%" }}>
            <ProfileCard
              user={isOwnProfile ? user || undefined : publicUser}
              isOwnProfile={isOwnProfile}
              profile={personalProfile}
              mentorProfile={mentorData}
              readOnly={readOnly}
              onOpenProfileSection={(section) =>
                handlers.openModal("setup-profile", section)
              }
              onEditClick={isOwnProfile ? () => handlers.openModal("setup-profile", "basic") : undefined}
              activeTab={search.pt || "about"}
              onTabChange={handlers.handleProfileTabChange}
              // services
              serviceModal={search.serviceModal}
              serviceId={search.serviceId}
              onOpenServiceModal={isOwnProfile ? handlers.openServiceModal : undefined}
              onCloseServiceModal={isOwnProfile ? handlers.closeServiceModal : undefined}
              handleServiceEdit={handlers.handleServiceEdit}
              handleServiceDelete={handlers.handleServiceDelete}
              // sessions
              sessions={isOwnProfile && shouldFetchMentorData ? freshSessions : mentorData?.sessions}
              sessionModal={search.sessionModal}
              sessionId={search.sessionId}
              onOpenSessionModal={isOwnProfile ? handlers.openSessionModal : undefined}
              onCloseSessionModal={isOwnProfile ? handlers.closeSessionModal : undefined}
              handleSessionEdit={handlers.handleSessionEdit}
              handleSessionDelete={handlers.handleSessionDelete}
              handleSessionViewDetails={handlers.handleSessionViewDetails}
              // settings
              onOpenSettings={handlers.handleOpenSettings}
            />
          </Box>

          {/* Sidebar Logic */}
          {shouldShowMobileSidebar ? (
            <MenteeSidebarCards
              isOwnProfile={isOwnProfile}
              user_is_mentor={userIsMentor}
              personalProfile={personalProfile}
              onEditProfile={(step) => handlers.openModal("setup-profile", step || "basic")}
            />
          ) : shouldShowDesktopSidebar ? (
            <DesktopSidebar
              search={search}
              mentorData={mentorData}
              readOnly={readOnly}
              isOwnProfile={isOwnProfile}
              handlers={handlers}
            />
          ) : null}
        </Flex>
      </Container>
    </>
  );
};

export default ProfilePage;