import { useState, useMemo } from "react";
import { Container, VStack, HStack, Text, Button, Spinner, Box } from "@chakra-ui/react";
import { MentorshipCalendar } from "./MentorshipCalendar";
import { SessionDetails } from "./SessionDetails";
import { useAuth } from "@/hooks/auth/useAuth";
import { groupSessionsByDate } from "@/utils/calendarDataTransformer";
import type { MentorSessionPublic, MentorSettingsPublic } from "@/client";

interface MentorshipCalendarContentProps {
  onEdit?: (session: MentorSessionPublic) => void;
  onDelete?: (session: MentorSessionPublic) => void;
  onViewDetails?: (session: MentorSessionPublic) => void;
  isOwnProfile?: boolean;
  mentorSessions?: MentorSessionPublic[] | undefined | null;
  mentorSettings?: MentorSettingsPublic | undefined | null;
  isLoading?: boolean;
}

/**
 * MentorshipCalendarContent - Shows mentor availability calendar
 * 
 * Purpose: Display and manage mentor sessions (teaching view)
 * - Own Profile: Shows MY mentor sessions (sessions I created)
 * - Other Profile: Shows their available sessions to book
 */
const MentorshipCalendarContent: React.FC<MentorshipCalendarContentProps> = ({
  onEdit,
  onDelete,
  onViewDetails,
  isOwnProfile,
  mentorSessions,
  mentorSettings,
  isLoading = false,
}) => {
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSessions, setSelectedSessions] = useState<MentorSessionPublic[]>([]);

  // Determine which sessions to display
  const displaySessions = useMemo(() => {
    if (!mentorSessions) return [];

    // VISITOR VIEW - Show only public, active, non-cancelled sessions
    if (!isOwnProfile) {
      return mentorSessions.filter(session =>
        session.is_public !== false &&
        session.is_active !== false &&
        !session.is_cancelled
      );
    }

    // OWN PROFILE - Show all MY mentor sessions (even private/cancelled for management)
    if (!user) return [];
    return mentorSessions.filter(s => s.mentor_id === user.id);

  }, [mentorSessions, user, isOwnProfile]);

  // Group sessions by date
  const groupedSessions = useMemo(() => {
    return groupSessionsByDate(displaySessions);
  }, [displaySessions]);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setSelectedSessions((groupedSessions[date] as unknown as MentorSessionPublic[]) || []);
  };

  const handleCloseDetails = () => {
    setSelectedDate(null);
    setSelectedSessions([]);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const allSessions = Object.values(groupedSessions).flat() as MentorSessionPublic[];
    const now = new Date();

    const upcoming = allSessions.filter((s) => {
      try {
        return !s.is_cancelled && new Date(s.start_time) > now;
      } catch {
        return false;
      }
    }).length;

    const completed = allSessions.filter((s) => {
      try {
        return new Date(s.end_time) <= now;
      } catch {
        return false;
      }
    }).length;

    const activeDays = Object.keys(groupedSessions).filter(
      date => (groupedSessions[date] || []).length > 0
    ).length;

    // Booking stats - only relevant for own profile
    const totalBookings = allSessions.reduce((acc, s) => acc + (s.total_bookings || 0), 0);
    const confirmedBookings = allSessions.reduce((acc, s) => acc + (s.confirmed_bookings || 0), 0);
    const pendingBookings = allSessions.reduce((acc, s) => acc + (s.pending_bookings || 0), 0);

    const anyUnlimited = allSessions.some((s) => s.available_spots == null);
    const availableSpots = anyUnlimited 
      ? null 
      : allSessions.reduce((acc, s) => acc + (s.available_spots || 0), 0);

    const totalCapacity = allSessions.reduce((acc, s) => acc + (s.max_bookings || 0), 0);
    const fillRate = totalCapacity > 0 
      ? Math.round((confirmedBookings / totalCapacity) * 100) 
      : null;

    return {
      upcoming,
      completed,
      activeDays,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      availableSpots,
      fillRate,
    };
  }, [groupedSessions]);

  // Privacy check: can the current viewer see this calendar?
  const canViewCalendar = useMemo(() => {
    // Owner always sees their own calendar
    if (isOwnProfile) return true;

    // Visitor: check if mentor allows public viewing
    return !!mentorSettings?.allow_public_availability_view;
  }, [isOwnProfile, mentorSettings?.allow_public_availability_view]);

  if (isLoading) {
    return (
      <Container maxW="4xl" p={0}>
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <Spinner size="lg" />
        </Box>
      </Container>
    );
  }

  // Show privacy message if can't view
  if (!canViewCalendar) {
    return (
      <Container maxW="4xl" p={0}>
        <Box
          textAlign="center"
          p={8}
          bg="cardbg"
          border="1px dashed"
          borderRadius="lg"
        >
          <Text fontSize="lg" fontWeight="semibold" mb={2}>
            🔒 Calendar Private
          </Text>
          <Text fontSize="sm" color="fg.muted">
            This mentor has chosen to keep their availability calendar private.
          </Text>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="4xl" p={0}>
      <VStack gap={6} align="stretch">
        {/* Quick Stats */}
        {Object.keys(groupedSessions).length > 0 && (
          <HStack gap={8} wrap="wrap" justify="center" fontSize="sm">
            <VStack gap={1}>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {stats.upcoming}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                {isOwnProfile ? "Upcoming" : "Available"}
              </Text>
            </VStack>
            
            <VStack gap={1}>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {stats.completed}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                Completed
              </Text>
            </VStack>
            
            <VStack gap={1}>
              <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                {stats.activeDays}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                Active Days
              </Text>
            </VStack>

            {/* Booking stats - ONLY for own profile */}
            {isOwnProfile && (
              <>
                <VStack gap={1}>
                  <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                    {stats.confirmedBookings}
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    Confirmed
                  </Text>
                </VStack>
                
                {stats.pendingBookings > 0 && (
                  <VStack gap={1}>
                    <Text fontSize="2xl" fontWeight="bold" color="yellow.500">
                      {stats.pendingBookings}
                    </Text>
                    <Text fontSize="xs" color="fg.muted">
                      Pending
                    </Text>
                  </VStack>
                )}

                {stats.fillRate !== null && (
                  <VStack gap={1}>
                    <Text fontSize="2xl" fontWeight="bold" color="teal.500">
                      {stats.fillRate}%
                    </Text>
                    <Text fontSize="xs" color="fg.muted">
                      Fill Rate
                    </Text>
                  </VStack>
                )}
              </>
            )}
          </HStack>
        )}

        {/* Empty State */}
        {Object.keys(groupedSessions).length === 0 && (
          <Box
            textAlign="center"
            p={8}
            bg="cardbg"
            border="1px dashed"
            borderColor="border.subtle"
            borderRadius="lg"
          >
            <Text fontSize="md" fontWeight="semibold" mb={2}>
              📅 No Sessions Found
            </Text>
            <Text fontSize="sm" color="fg.muted" mb={4}>
              {isOwnProfile
                ? "Create your first session to start mentoring"
                : "This mentor has no available sessions at the moment"}
            </Text>
            {isOwnProfile && user?.is_mentor && (
              <Button 
                size="sm" 
                colorPalette="blue"
                onClick={() => {
                  window.location.href = `/profile/${user.uuid}?st=sessions&sessionModal=create`;
                }}
              >
                Create Session
              </Button>
            )}
          </Box>
        )}

        {/* Calendar */}
        {Object.keys(groupedSessions).length > 0 && (
          <MentorshipCalendar
            sessions={groupedSessions}
            onDateClick={handleDateClick}
            mentorSettings={mentorSettings}
            isOwnProfile={isOwnProfile}
          />
        )}

        {/* Session Details Modal */}
        {selectedDate && selectedSessions.length > 0 && (
          <SessionDetails
            isOpen={!!selectedDate}
            date={selectedDate}
            sessions={selectedSessions}
            onClose={handleCloseDetails}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
            showActions={isOwnProfile} // Actions only for own sessions
          />
        )}
      </VStack>
    </Container>
  );
};

export default MentorshipCalendarContent;