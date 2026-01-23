import { useState, useEffect, useMemo } from "react";
import {
  Box,
  VStack,
  Heading,
  Button,
  Text,
  Flex,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { Tabs } from "@chakra-ui/react";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { FaCircleXmark, FaPlus } from "react-icons/fa6";
import { LuCalendar, LuClock } from "react-icons/lu";
import { useColorModeValue } from "@/components/ui";
import SessionFormModal from "./SessionFormModal";
import { useMentorSessions } from "@/hooks/mentor/useMentorSessions";
import type { MentorSessionPublic } from "@/client";
import SessionCard from "./SessionCard";
// const LazySessionDetailModal = lazy(() => import("@/components/dashboard/mentor/sessions/sessionDetails/Index"));

import { FaCheckCircle } from "react-icons/fa";

interface SessionsContentProps {
  sessions: MentorSessionPublic[];
  readOnly: boolean;

  // Modal control props
  sessionModal?: "create" | "edit";
  sessionId?: string;
  onOpenSessionModal?: (mode: "create" | "edit", sessionId?: string) => void;
  onCloseSessionModal?: () => void;

  // Action handlers
  onEdit?: (session: MentorSessionPublic) => void;
  onDelete?: (session: MentorSessionPublic) => void;
  onViewDetails?: (session: MentorSessionPublic) => void;
}

// type SessionFilter = "all" | "active" | "completed" | "cancelled";

const SessionsContent = ({
  sessions = [],
  readOnly,
  sessionModal,
  sessionId,
  onOpenSessionModal,
  onCloseSessionModal,
  onEdit,
  onDelete,
  onViewDetails,
}: SessionsContentProps) => {
  const { deleteSession } = useMentorSessions();

  const [editingSession, setEditingSession] = useState<MentorSessionPublic | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<MentorSessionPublic | null>(null);

  const borderCol = useColorModeValue("gray.200", "gray.600");

  // Load editing session when URL changes
  useEffect(() => {
    if (sessionModal === "edit" && sessionId && sessions.length > 0) {
      const session = sessions.find((s) => s.uuid === sessionId);
      if (session) {
        setEditingSession(session);
      }
    } else if (sessionModal === "create") {
      setEditingSession(null);
    }
  }, [sessionModal, sessionId, sessions]);

  // Filter sessions by status
  const filteredSessions = useMemo(() => {
    const now = new Date();

    const categorized = {
      active: sessions.filter(
        (s) =>
          s.is_active &&
          !s.is_cancelled &&
          new Date(s.end_time) > now
      ),
      completed: sessions.filter((s) => new Date(s.end_time) <= now),
      cancelled: sessions.filter((s) => s.is_cancelled || !s.is_active),
      all: sessions,
    };

    return categorized;
  }, [sessions]);

  const handleCreate = () => onOpenSessionModal?.("create");

  const confirmDelete = () => {
    if (sessionToDelete) {
      deleteSession(sessionToDelete.id);
      setIsDeleteDialogOpen(false);
      setSessionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  const handleCloseModal = () => {
    setEditingSession(null);
    onCloseSessionModal?.();
  };

  // const onCloseDetailModal = () => {
  //   setSelectedSession(null);
  //   setIsDetailModalOpen(false);
  // };

  const isModalOpen = !readOnly && (sessionModal === "create" || sessionModal === "edit");

  // Empty state
  if (!sessions || sessions.length === 0) {
    if (readOnly) return <Text>No sessions available.</Text>;

    return (
      <>
        <Box
          w="full"
          p={8}
          border="1px dashed"
          borderColor={borderCol}
          borderRadius="2xl"
          textAlign="center"
          bg="cardbg"
        >
          <Heading size="sm" mb={2}>
            You haven't created any sessions yet.
          </Heading>
          <Text fontSize="sm" color="fg.muted" mb={4}>
            Create your first mentorship session and start connecting with mentees.
          </Text>
          <Button onClick={handleCreate}>
            <LuCalendar />
            Create Session
          </Button>
        </Box>

        <SessionFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          session={editingSession}
        />
      </>
    );
  }

  return (
    <>
      <VStack align="stretch" gap={2} h="full">
        {/* Header with Create Button */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading size="sm">{readOnly ? "Sessions" : "Your Sessions"}</Heading>
          {!readOnly && (
            <Button size="sm" variant="outline" onClick={handleCreate}>
              <FaPlus />
              Add New Session
            </Button>
          )}
        </Box>

        {/* Tabs with Filters */}
        <Tabs.Root defaultValue="active" variant="enclosed">
          <Tabs.List w={readOnly ? "" : "full"} justifyContent={readOnly ? "flex_start" : "space-between"}>
            <Tabs.Trigger value="active">
              <HStack gap={1.5}>
                <LuClock size={16} />
                <Text>Active</Text>
                <Badge size="xs" colorPalette="blue">
                  {filteredSessions.active.length}
                </Badge>
              </HStack>
            </Tabs.Trigger>

            <Tabs.Trigger value="completed">
              <HStack gap={1.5}>
                <FaCheckCircle size={16} />
                <Text>Completed</Text>
                <Badge size="xs" colorPalette="green">
                  {filteredSessions.completed.length}
                </Badge>
              </HStack>
            </Tabs.Trigger>
            {!readOnly && (
              <Tabs.Trigger value="cancelled">
                <HStack gap={1.5}>
                  <FaCircleXmark size={16} />
                  <Text>Cancelled</Text>
                  <Badge size="xs" colorPalette="red">
                    {filteredSessions.cancelled.length}
                  </Badge>
                </HStack>
              </Tabs.Trigger>
            )}

            {/* <Tabs.Trigger value="all">
              <HStack gap={1.5}>
                <LuCalendar size={16} />
                <Text>All</Text>
                <Badge size="xs" colorPalette="gray">
                  {filteredSessions.all.length}
                </Badge>
              </HStack>
            </Tabs.Trigger> */}

            <Tabs.Indicator />
          </Tabs.List>

          {/* Active Sessions Tab */}
          <Tabs.Content value="active">
            <Box maxH="600px" overflowY="auto">
              {filteredSessions.active.length > 0 ? (
                <Flex wrap="wrap" gap={4}>
                  {filteredSessions.active.map((session) => (
                    <Box flex="1 1 280px" minW="280px" key={session.uuid}>
                      <SessionCard
                        session={session}
                        onEdit={!readOnly ? onEdit : undefined}
                        onDelete={!readOnly ? onDelete : undefined}
                        showActions={!readOnly}
                        onViewDetails={onViewDetails}
                      />
                    </Box>
                  ))}
                </Flex>
              ) : (
                <Box py={12} textAlign="center" bg="cardbg" border="1px dotted" borderRadius={"md"}>
                  <Text color="fg.muted">No active sessions</Text>
                  <Text fontSize="sm" color="fg.subtle" mt={2}>
                    {readOnly
                      ? "Check back later for new sessions"
                      : "Create a new session to get started"}
                  </Text>
                </Box>
              )}
            </Box>
          </Tabs.Content>

          {/* Completed Sessions Tab */}
          <Tabs.Content value="completed">
            <Box maxH="600px" overflowY="auto">
              {filteredSessions.completed.length > 0 ? (
                <Flex wrap="wrap" gap={4}>
                  {filteredSessions.completed.map((session) => (
                    <Box flex="1 1 280px" minW="280px" key={session.uuid}>
                      <SessionCard
                        session={session}
                        onEdit={!readOnly ? onEdit : undefined}
                        onDelete={!readOnly ? onDelete : undefined}
                        showActions={!readOnly}
                        onViewDetails={onViewDetails}
                      />
                    </Box>
                  ))}
                </Flex>
              ) : (
                <Box py={12} textAlign="center" bg="cardbg" border="1px dotted" borderRadius={"md"}>
                  <Text color="fg.muted">No completed sessions</Text>
                  <Text fontSize="sm" color="fg.subtle" mt={2}>
                    Completed sessions will appear here
                  </Text>
                </Box>
              )}
            </Box>
          </Tabs.Content>

          {/* Cancelled Sessions Tab */}
          <Tabs.Content value="cancelled">
            <Box maxH="600px" overflowY="auto">
              {filteredSessions.cancelled.length > 0 ? (
                <Flex wrap="wrap" gap={4}>
                  {filteredSessions.cancelled.map((session) => (
                    <Box flex="1 1 280px" minW="280px" key={session.uuid}>
                      <SessionCard
                        session={session}
                        onEdit={!readOnly ? onEdit : undefined}
                        onDelete={!readOnly ? onDelete : undefined}
                        showActions={!readOnly}
                        onViewDetails={onViewDetails}
                      />
                    </Box>
                  ))}
                </Flex>
              ) : (
                <Box py={12} textAlign="center" bg={"cardbg"} borderRadius={"md"} border={"1px dotted"}>
                  <Text color="fg.muted">No cancelled sessions</Text>
                  <Text fontSize="sm" color="fg.subtle" mt={2}>
                    Cancelled sessions will appear here
                  </Text>
                </Box>
              )}
            </Box>
          </Tabs.Content>

          {/* All Sessions Tab - Grouped by Status */}
          {/* <Tabs.Content value="all">
            <VStack align="stretch" gap={6} maxH="600px" overflowY="auto" pr={2} py={4}>

              {filteredSessions.active.length > 0 && (
                <Box>
                  <HStack gap={2} mb={3}>
                    <LuClock size={18} />
                    <Heading size="xs" textTransform="uppercase" color="fg.muted">
                      Active ({filteredSessions.active.length})
                    </Heading>
                  </HStack>
                  <Flex wrap="wrap" gap={4}>
                    {filteredSessions.active.map((session) => (
                      <Box flex="1 1 280px" minW="280px" maxW="400px" key={session.uuid}>
                        <SessionCard
                          session={session}
                          onEdit={!readOnly ? onEdit : undefined}
                          onDelete={!readOnly ? onDelete : undefined}
                          showActions={!readOnly || !session.is_cancelled}
                          onViewDetails={onViewDetails}
                        />
                      </Box>
                    ))}
                  </Flex>
                </Box>
              )}

       
              {filteredSessions.completed.length > 0 && (
                <Box>
                  <HStack gap={2} mb={3}>
                    <FaCheckCircle size={18} />
                    <Heading size="xs" textTransform="uppercase" color="fg.muted">
                      Completed ({filteredSessions.completed.length})
                    </Heading>
                  </HStack>
                  <Flex wrap="wrap" gap={4}>
                    {filteredSessions.completed.map((session) => (
                      <Box flex="1 1 280px" minW="280px" maxW="400px" key={session.uuid}>
                        <SessionCard
                          session={session}
                          onEdit={!readOnly ? onEdit : undefined}
                          onDelete={!readOnly ? onDelete : undefined}
                          showActions={!readOnly || !session.is_cancelled}
                          onViewDetails={onViewDetails}
                        />
                      </Box>
                    ))}
                  </Flex>
                </Box>
              )}

              {filteredSessions.cancelled.length > 0 && (
                <Box>
                  <HStack gap={2} mb={3}>
                    <FaCircleXmark size={18} />
                    <Heading size="xs" textTransform="uppercase" color="fg.muted">
                      Cancelled ({filteredSessions.cancelled.length})
                    </Heading>
                  </HStack>
                  <Flex wrap="wrap" gap={4}>
                    {filteredSessions.cancelled.map((session) => (
                      <Box flex="1 1 280px" minW="280px" maxW="400px" key={session.uuid}>
                        <SessionCard
                          session={session}
                          onEdit={!readOnly ? onEdit : undefined}
                          onDelete={!readOnly ? onDelete : undefined}
                          showActions={!readOnly || !session.is_cancelled}
                          onViewDetails={onViewDetails}
                        />
                      </Box>
                    ))}
                  </Flex>
                </Box>
              )}
            </VStack>
          </Tabs.Content> */}
        </Tabs.Root>
      </VStack>

      {/* Edit/Create Modal */}
      <SessionFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        session={editingSession}
      />

      {/* Delete Confirmation Dialog */}
      <DialogRoot
        open={isDeleteDialogOpen}
        onOpenChange={(e) => setIsDeleteDialogOpen(e.open)}
        role="alertdialog"
        placement="center"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Session</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text>
              Are you sure you want to cancel{" "}
              <Text as="span" fontWeight="bold">
                "{sessionToDelete?.title}"
              </Text>
              ? This action cannot be undone.
            </Text>

            <Text mt={2} fontSize="xs" color="fg.muted">
              The session will be marked as cancelled. You will still see it in your
              history, but mentees won't be able to book it.
            </Text>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline" onClick={cancelDelete}>
                Keep
              </Button>
            </DialogActionTrigger>
            <Button colorPalette="red" onClick={confirmDelete}>
              Cancel Session
            </Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>

      {/* Session Detail Modal
      <LazySessionDetailModal
        session={selectedSession}
        isOpen={isDetailModalOpen}
        onClose={onCloseDetailModal}
      /> */}
    </>
  );
};

export default SessionsContent;