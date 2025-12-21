import { Box, Flex, Container, Spinner } from "@chakra-ui/react";
import { useBreakpointValue } from "@chakra-ui/react";
import { useParams, useRouter, useSearch } from "@tanstack/react-router";
import { useState } from "react";

import { useAuthRouteGuard } from "@/hooks/auth/useAuthRouteGuard";
import { useAuth } from "@/hooks/auth/useAuth";
import { useMentorSessions } from "@/hooks/mentor/useMentorSessions";
import { useUserByUuid } from "@/hooks/public/useProfile";
import { useMentorSettings } from "@/hooks/mentor/useMentorSettings";
import { useProfilePageHandlers } from "@/hooks/public/useProfilePageHandlers";

import type { MentorSessionPublic, MentorServicePublic } from "@/client";

import DeleteSessionDialog from "@/components/dashboard/mentor/sessions/DeleteSessionDialog";
import DeleteServiceDialog from "@/components/dashboard/mentor/services/DeleteServiceDialog";
import MenteeSidebar from "@/components/profile/profilePage/MenteeSidebar";
import DesktopSidebar from "@/components/profile/profilePage/DesktopSidebar";
import ProfileEditModal from "@/components/dashboard/profileCard/editProfileCard/ProfileEditModal";
import MentorProfileSetupModal from "@/components/dashboard/mentor/mentorProfileSetup/MentorProfileSetupModal";
import MentorSettingsDialog from "@/components/dashboard/mentor/settings/mentorSettingsDialog.tsx/Index";
import SessionDetailModal from "@/components/dashboard/mentor/sessions/sessionDetails/Index";
import ProfileCard from "@/components/dashboard/profileCard/Index";

import { useMentorServices } from "@/hooks/mentor/useMentorServices";
import ProfilePageLoadingState from "@/components/profile/profilePage/loadingSkeletons/ProfilePageLoadingState";
import DesktopSidebarLoadingState from "@/components/profile/profilePage/loadingSkeletons/DesktopSidebarLoadingState";

const ProfilePage = () => {
  const router = useRouter();
  const search = useSearch({ strict: false });
  const params = useParams({ strict: false });
  const { uuid } = params;

  const { isBlocked, isLoading: isAuthLoading } = useAuthRouteGuard();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const { user } = useAuth();
  const isOwnProfile = user?.uuid === uuid;

  const { data: publicUser, isLoading: isPublicUserLoading } = useUserByUuid(uuid);

  // Determine if we need mentor-specific hooks BEFORE calling them
  const shouldFetchMentorData = isOwnProfile && user?.is_mentor;

  // Only call mentor hooks when needed
  const mentorSessionsHook = useMentorSessions({ enabled: shouldFetchMentorData });
  const mentorServicesHook = useMentorServices({ enabled: shouldFetchMentorData });
  const mentorSettingsHook = useMentorSettings({ enabled: shouldFetchMentorData });

  // states for session and service deletion dialogs
  const [isDeleteSessionDialogOpen, setIsDeleteSessionDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<MentorSessionPublic | null>(null);

  const [isDeleteServiceDialogOpen, setIsDeleteServiceDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<MentorServicePublic | null>(null);

  // Profile data
  const personalProfile = isOwnProfile ? user?.profile : publicUser?.profile;
  const mentorData = isOwnProfile
    ? user?.profile?.mentor_profile
    : publicUser?.profile?.mentor_profile;

  // Settings - only use mentor settings hook data if we're viewing own mentor profile
  const settings = shouldFetchMentorData 
    ? mentorSettingsHook.settings 
    : mentorData?.settings;
  const updateSettingsAsync = shouldFetchMentorData 
    ? mentorSettingsHook.updateSettingsAsync 
    : undefined;
  const isUpdating = shouldFetchMentorData 
    ? mentorSettingsHook.isUpdating 
    : false;

  const readOnly = !isOwnProfile;

  // Determine if the profile being viewed belongs to a mentor
  const profileUserIsMentor = isOwnProfile ? user?.is_mentor : publicUser?.is_mentor;

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

  // Find selected session from URL
  const selectedSessionFromUrl = search.sessionDetailId
    ? mentorData?.sessions?.find((s) => s.uuid === search.sessionDetailId)
    : null;

  // Loading state
  if (isAuthLoading || isPublicUserLoading || isBlocked) {
    return (
      <Container h="full" p={{ base: 2, md: 5 }} maxW="breakpoint-xl">
        <Flex justify="space-between" gap={5} direction={{ base: "column", md: "row" }}>
          <Box flex={{ base: "none", lg: "0 0 60%" }} w={{ base: "100%", lg: "60%" }}>
            <ProfilePageLoadingState />
          </Box>

          {isMobile ? (
            <Flex justify="center" align="center" h="30vh" bg={"bg"} borderRadius={"xl"}>
              <Spinner size="lg" />
            </Flex>
          ) : (
            <DesktopSidebarLoadingState />
          )}
        </Flex>
      </Container>
    );
  }

  // Determine which sidebar to show
  const shouldShowMobileSidebar = isMobile || !profileUserIsMentor;
  const shouldShowDesktopSidebar = !isMobile && profileUserIsMentor;

  return (
    <>
      {/* Modals */}
      {isOwnProfile && (
        <>
          <ProfileEditModal
            isOpen={search.drawer === "setup-profile"}
            onClose={handlers.closeModal}
            initialStep={search.step || "basic"}
          />

          <MentorProfileSetupModal
            isOpen={search.drawer === "mentor-setup"}
            onClose={handlers.closeModal}
          />

          <MentorSettingsDialog
            isOpen={search.settings === "open"}
            onClose={handlers.handleCloseSettings}
            settings={settings}
            onSave={handlers.handleSaveSettings}
            isUpdating={isUpdating}
          />
        </>
      )}

      {/* Delete Session Confirmation Dialog */}
      <DeleteSessionDialog
        isOpen={isDeleteSessionDialogOpen}
        session={sessionToDelete}
        onClose={handlers.cancelSessionDelete}
        onConfirm={handlers.confirmSessionDelete}
      />

      {/* Delete Service Confirmation Dialog  */}
      <DeleteServiceDialog
        isOpen={isDeleteServiceDialogOpen}
        service={serviceToDelete}
        onClose={handlers.cancelServiceDelete}
        onConfirm={handlers.confirmServiceDelete}
      />

      {/* Session Detail Modal */}
      <SessionDetailModal
        session={selectedSessionFromUrl || null}
        isOpen={!!search.sessionDetailId}
        onClose={handlers.closeSessionDetailModal}
      />

      {/* Main Content */}
      <Container h="full" p={{ base: 2, md: 5 }} maxW="breakpoint-xl">
        <Flex justify="space-between" gap={5} direction={{ base: "column", md: "row" }}>
          <Box flex={{ base: "none", lg: "0 0 60%" }} w={{ base: "100%", lg: "60%" }}>
            <ProfileCard
              user={isOwnProfile ? user || undefined : publicUser}
              isOwnProfile={isOwnProfile}
              profile={personalProfile || undefined}
              mentorProfile={mentorData || undefined}
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

          {/* Sidebar Logic:
              - MobileSidebar: Show on mobile OR when viewing a non-mentor profile
              - DesktopSidebar: Show on desktop AND when viewing a mentor profile
          */}
          {shouldShowMobileSidebar ? (
            <MenteeSidebar
              isOwnProfile={isOwnProfile}
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