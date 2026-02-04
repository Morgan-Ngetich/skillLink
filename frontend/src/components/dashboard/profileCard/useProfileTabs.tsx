import { FaServicestack } from 'react-icons/fa';
import { LuUser, LuStar, LuActivity, LuCalendar, LuClock4 } from 'react-icons/lu';
import type { MentorProfilePublic, MentorServicePublic, MentorSessionPublic, UserProfilePublic, UserPublic } from '@/client';

import AboutTab from './sections/tabs/aboutTab/Index';
import ReviewsTab from './sections/tabs/ReviewsTab';
import ActivityTab from './sections/tabs/ActivityTab';
import ServicesTab from './sections/tabs/ServicesTab';
import SessionsTab from './sections/tabs/SessionsTab';
import MyBookingsTab from './sections/tabs/myBookingsTab/MyBookingsTab';

interface UseProfileTabsProps {
  user?: UserPublic;
  profile?: UserProfilePublic;
  mentorProfile?: MentorProfilePublic;
  readOnly?: boolean;
  isMobile?: boolean;
  isOwnProfile?: boolean;

  onOpenProfileSection?: (section: string) => void;

  // Service props
  serviceModal?: "create" | "edit";
  serviceId?: string;
  onOpenServiceModal?: (mode: "create" | "edit", serviceId?: string) => void;
  onCloseServiceModal?: () => void;

  // Session props
  sessions?: MentorSessionPublic[];
  sessionModal?: "create" | "edit";
  sessionId?: string;
  onOpenSessionModal?: (mode: "create" | "edit", sessionId?: string) => void;
  onCloseSessionModal?: () => void;

  // Handlers
  handleSessionEdit?: (session: MentorSessionPublic) => void;
  handleSessionDelete?: (session: MentorSessionPublic) => void;
  handleSessionViewDetails?: (session: MentorSessionPublic) => void;
  handleServiceEdit?: (service: MentorServicePublic) => void;
  handleServiceDelete?: (service: MentorServicePublic) => void;
}


export const useProfileTabs = ({
  user,
  profile,
  mentorProfile,
  readOnly,
  onOpenProfileSection,
  isMobile,
  isOwnProfile,
  serviceModal,
  serviceId,
  onOpenServiceModal,
  onCloseServiceModal,
  sessions,
  sessionModal,
  sessionId,
  onOpenSessionModal,
  onCloseSessionModal,
  handleSessionEdit,
  handleSessionDelete,
  handleSessionViewDetails,
  handleServiceEdit,
  handleServiceDelete,
}: UseProfileTabsProps) => {
  const tabs = [
    {
      value: 'about',
      label: 'About',
      icon: LuUser,
      content: (
        <AboutTab
          profile={profile}
          onEdit={{
            basic: isOwnProfile
              ? () => onOpenProfileSection?.("basic")
              : undefined,
            experience: isOwnProfile
              ? () => onOpenProfileSection?.("experience")
              : undefined,
            education: isOwnProfile
              ? () => onOpenProfileSection?.("education")
              : undefined,
            goals: isOwnProfile
              ? () => onOpenProfileSection?.("goals")
              : undefined,
            skills: isOwnProfile
              ? () => onOpenProfileSection?.("skills")
              : undefined,
            interests: isOwnProfile
              ? () => onOpenProfileSection?.("skills")
              : undefined,
          }}
        />
      ),
    },
    {
      value: 'services',
      label: 'Services',
      icon: FaServicestack,
      content: (
        <ServicesTab
          services={mentorProfile?.services || []}
          readOnly={readOnly}
          serviceModal={serviceModal}
          serviceId={serviceId}
          onOpenServiceModal={onOpenServiceModal}
          onCloseServiceModal={onCloseServiceModal}
          onEdit={handleServiceEdit}
          onDelete={handleServiceDelete}
        />
      ),
      showIf: isMobile && user?.is_mentor,
    },
    {
      value: 'sessions',
      label: 'Sessions',
      icon: LuClock4,
      content: (
        <SessionsTab
          sessions={mentorProfile?.sessions || sessions || []}
          readOnly={readOnly}
          sessionModal={sessionModal}
          sessionId={sessionId}
          onOpenSessionModal={onOpenSessionModal}
          onCloseSessionModal={onCloseSessionModal}
          onEdit={handleSessionEdit}
          onDelete={handleSessionDelete}
          onViewDetails={handleSessionViewDetails}
        />
      ),
      showIf: isMobile && user?.is_mentor,
    },
    {
      value: 'reviews',
      label: 'Reviews',
      icon: LuStar,
      content: <ReviewsTab isMentor={user?.is_mentor} />,
      showIf: user?.is_mentor,
    },
    {
      value: 'activity',
      label: 'Activity',
      icon: LuActivity,
      content: <ActivityTab isMentor={user?.is_mentor} />,
      showIf: !readOnly,
    },
    {
      value: "myBookings",
      label: "My bookings",
      icon: LuCalendar,
      content: (
        <MyBookingsTab
          isOwnProfile={!!isOwnProfile}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onViewBooking={handleSessionViewDetails as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onCancelBooking={handleSessionDelete as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onEditBooking={handleSessionEdit as any}
        />
      ),
      showIf: isOwnProfile,
    }
  ].filter((tab) => tab.showIf !== false);



  return tabs;
};