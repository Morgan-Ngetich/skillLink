import { Box, Separator, Tabs } from '@chakra-ui/react';
import { useBreakpointValue } from '@chakra-ui/react';
import type { MentorProfilePublic, MentorServicePublic, MentorSessionPublic, UserProfilePublic, UserPublic } from '@/client';

import UserProfileBanner from './sections/header/UserProfileBanner';
import { useProfileTabs } from './useProfileTabs';

interface ProfileCardProps {
  user?: UserPublic;
  isOwnProfile?: boolean;
  profile?: UserProfilePublic;
  mentorProfile?: MentorProfilePublic;
  readOnly?: boolean;
  onEditClick?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;

  // Service modal props
  serviceModal?: "create" | "edit";
  serviceId?: string;
  onOpenServiceModal?: (mode: "create" | "edit", serviceId?: string) => void;
  onCloseServiceModal?: () => void;

  // Session modal props
  sessionModal?: "create" | "edit";
  sessionId?: string;
  onOpenSessionModal?: (mode: "create" | "edit", sessionId?: string) => void;
  onCloseSessionModal?: () => void;

  // Session handlers
  handleSessionEdit?: (session: MentorSessionPublic) => void;
  handleSessionDelete?: (session: MentorSessionPublic) => void;
  handleSessionViewDetails?: (session: MentorSessionPublic) => void;

  // Service handlers
  handleServiceEdit?: (service: MentorServicePublic) => void;
  handleServiceDelete?: (service: MentorServicePublic) => void;

  // Settings props
  onOpenSettings?: () => void;
}

export default function ProfileCard({
  user,
  isOwnProfile,
  profile,
  mentorProfile,
  readOnly = false,
  onEditClick,
  activeTab = 'about',
  onTabChange,
  serviceModal,
  serviceId,
  onOpenServiceModal,
  onCloseServiceModal,
  sessionModal,
  sessionId,
  onOpenSessionModal,
  onCloseSessionModal,
  handleSessionEdit,
  handleSessionDelete,
  handleSessionViewDetails,
  handleServiceEdit,
  handleServiceDelete,
  onOpenSettings,
}: ProfileCardProps) {
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Get tab configuration
  const tabs = useProfileTabs({
    user,
    profile,
    mentorProfile,
    readOnly,
    isMobile,
    serviceModal,
    serviceId,
    onOpenServiceModal,
    onCloseServiceModal,
    sessionModal,
    sessionId,
    onOpenSessionModal,
    onCloseSessionModal,
    handleSessionEdit,
    handleSessionDelete,
    handleSessionViewDetails,
    handleServiceEdit,
    handleServiceDelete,
    isOwnProfile,
  });

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
        readOnly={readOnly}
        onOpenSettings={onOpenSettings}
      />

      <Box px={{ base: 0, md: 6 }} pt={{ base: 3, md: 5 }} pb={3}>
        <Separator display={{ base: 'none', md: 'block' }} mb={4} />

        <Tabs.Root value={activeTab} onValueChange={(e) => onTabChange?.(e.value)} w="full">
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