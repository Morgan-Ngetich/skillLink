import type { MentorSessionPublic, MentorSettingsPublic } from '@/client';
import MentorshipCalendarContent from '../../../calendar/MentorshipCalendarContent ';

interface CalendarTabProps {
  isOwnProfile?: boolean;
  mentorSessions?: MentorSessionPublic[];
  mentorSettings?: MentorSettingsPublic;
  onEdit?: (session: MentorSessionPublic) => void;
  onDelete?: (session: MentorSessionPublic) => void;
  onViewDetails?: (session: MentorSessionPublic) => void;
}

const CalendarTab = ({
  isOwnProfile,
  mentorSessions,
  mentorSettings,
  onEdit,
  onDelete,
  onViewDetails,
}: CalendarTabProps) => {
  return (
    <MentorshipCalendarContent
      onEdit={onEdit}
      onDelete={onDelete}
      onViewDetails={onViewDetails}
      isOwnProfile={isOwnProfile}
      mentorSessions={mentorSessions || []}
      mentorSettings={mentorSettings}
    />
  );
};

export default CalendarTab;