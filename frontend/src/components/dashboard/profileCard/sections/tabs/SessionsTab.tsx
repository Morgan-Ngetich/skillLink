import { VStack } from '@chakra-ui/react';
import type { MentorSessionPublic } from '@/client';
import SessionsContent from '@/components/dashboard/mentor/sessions/SessionsContent';

interface SessionsTabProps {
  sessions: MentorSessionPublic[];
  readOnly?: boolean;
  sessionModal?: "create" | "edit";
  sessionId?: string;
  onOpenSessionModal?: (mode: "create" | "edit", sessionId?: string) => void;
  onCloseSessionModal?: () => void;
  onEdit?: (session: MentorSessionPublic) => void;
  onDelete?: (session: MentorSessionPublic) => void;
  onViewDetails?: (session: MentorSessionPublic) => void;
}

/*
 * SessionsTab component is only for mobile view
*/
const SessionsTab = ({
  sessions,
  readOnly,
  sessionModal,
  sessionId,
  onOpenSessionModal,
  onCloseSessionModal,
  onEdit,
  onDelete,
  onViewDetails,
}: SessionsTabProps) => {
  return (
    <VStack gap={4} align="stretch">
      <SessionsContent
        sessions={sessions}
        readOnly={!!readOnly}
        sessionModal={sessionModal}
        sessionId={sessionId}
        onOpenSessionModal={onOpenSessionModal}
        onCloseSessionModal={onCloseSessionModal}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewDetails={onViewDetails}
      />
    </VStack>
  );
};

export default SessionsTab;
