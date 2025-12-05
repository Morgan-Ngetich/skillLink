import { useState, useMemo } from "react";
import { Container, VStack, HStack, Text, Button, Spinner, Box } from "@chakra-ui/react";
import { MentorshipCalendar } from "./MentorshipCalendar";
import { SessionDetails } from "./SessionDetails";
import { useAuth } from "@/hooks/auth/useAuth";
import { useMentorBookings } from "@/hooks/mentor/useMentorBookings";
import { groupSessionsByDate } from "@/utils/calendarDataTransformer";
import type { MentorSessionPublic, MentorSettingsPublic } from "@/client";

type ViewMode = "my-sessions" | "booked-sessions";

interface MentorshipCalendarContentProps {
  onEdit?: (session: MentorSessionPublic) => void;
  onDelete?: (session: MentorSessionPublic) => void;
  onViewDetails?: (session: MentorSessionPublic) => void;
  isOwnProfile?: boolean;
  mentorSessions?: MentorSessionPublic[];
  mentorSettings?: MentorSettingsPublic;
}

const MentorshipCalendarContent: React.FC<MentorshipCalendarContentProps> = ({
  onEdit,
  onDelete,
  onViewDetails,
  isOwnProfile,
  mentorSessions,
  mentorSettings,
}) => {
  const { user } = useAuth();

  // Local minimal type describing the session fields we rely on for stats
  type SessionStats = {
    start_time: string;
    end_time: string;
    is_cancelled?: boolean;
    total_bookings?: number;
    confirmed_bookings?: number;
    pending_bookings?: number;
    available_spots?: number | null;
    max_bookings?: number | null;
  };

  // Fetch booked sessions (as mentee) - only for own profile
  const { bookings: bookedSessions, isLoading: bookedLoading } = useMentorBookings();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSessions, setSelectedSessions] = useState<MentorSessionPublic[]>([]);

  // Default view mode - only relevant for own profile
  const [viewMode, setViewMode] = useState<ViewMode>(
    isOwnProfile && user?.is_mentor ? "my-sessions" : "booked-sessions"
  );

  // Determine which sessions to display
  const displaySessions = useMemo(() => {
    // VISITOR VIEW
    if (!isOwnProfile) {
      return (mentorSessions || []).filter(session =>
        session.is_public !== false &&
        session.is_active !== false &&
        !session.is_cancelled
      );
    }

    // OWN PROFILE — mentor mode
    if (viewMode === "my-sessions") {
      if (!user) return [];
      return (mentorSessions || []).filter(s => s.mentor_id === user.id);
    }

    // OWN PROFILE — mentee mode (booked sessions)
    return (bookedSessions || [])
      .map(b => {
        const session = mentorSessions?.find(s => s.id === b.session_id);
        if (!session) return null;
        return {
          ...session,
          booking_status: b.status,
          booking_id: b.id,
        };
      })
      .filter(Boolean) as MentorSessionPublic[];

  }, [mentorSessions, bookedSessions, user, viewMode, isOwnProfile]);


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
    const allSessions = Object.values(groupedSessions).flat() as SessionStats[];
    const now = new Date();

    const upcoming = allSessions.filter((s: SessionStats) => {
      try {
        return !s.is_cancelled && new Date(s.start_time) > now;
      } catch {
        return false;
      }
    }).length;

    const completed = allSessions.filter((s: SessionStats) => {
      try {
        return new Date(s.end_time) <= now;
      } catch {
        return false;
      }
    }).length;

    const activeDays = Object.keys(groupedSessions).filter(date => (groupedSessions[date] || []).length > 0).length;

    const totalBookings = allSessions.reduce((acc: number, s: SessionStats) => acc + (s.total_bookings || 0), 0);
    const confirmedBookings = allSessions.reduce((acc: number, s: SessionStats) => acc + (s.confirmed_bookings || 0), 0);
    const pendingBookings = allSessions.reduce((acc: number, s: SessionStats) => acc + (s.pending_bookings || 0), 0);

    const anyUnlimited = allSessions.some((s: SessionStats) => s.available_spots == null);
    const availableSpots = anyUnlimited ? null : allSessions.reduce((acc: number, s: SessionStats) => acc + (s.available_spots || 0), 0);

    const totalCapacity = allSessions.reduce((acc: number, s: SessionStats) => acc + (s.max_bookings || 0), 0);
    const fillRate = totalCapacity > 0 ? Math.round((confirmedBookings / totalCapacity) * 100) : null;

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

  const isLoading = !mentorSessions || !mentorSettings || (isOwnProfile && bookedLoading);

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
          borderColor="border.subtle"
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

  // Count sessions for toggle buttons (ONLY for own profile)
  const mySessionsCount = isOwnProfile && user ? (mentorSessions || []).filter(s => s.mentor_id === user.id).length : 0;
  const bookedSessionsCount = (bookedSessions || []).length;

  return (
    <Container maxW="4xl" p={0}>
      <VStack gap={6} align="stretch">
        {/* View Mode Toggle - ONLY show for OWN profile when user is a mentor */}
        {isOwnProfile && user?.is_mentor && (
          <VStack gap={2} align="stretch">
            <Text fontSize="xs" color="fg.muted" textAlign="center">
              View Calendar As
            </Text>
            <HStack gap={3} justify="center" wrap="wrap">
              <Button
                size="sm"
                variant={viewMode === "my-sessions" ? "solid" : "outline"}
                onClick={() => setViewMode("my-sessions")}
                colorPalette={viewMode === "my-sessions" ? "blue" : undefined}
              >
                🎓 Mentor ({mySessionsCount})
              </Button>
              <Button
                size="sm"
                variant={viewMode === "booked-sessions" ? "solid" : "outline"}
                onClick={() => setViewMode("booked-sessions")}
                colorPalette={viewMode === "booked-sessions" ? "purple" : undefined}
              >
                📚 Mentee ({bookedSessionsCount})
              </Button>
            </HStack>
          </VStack>
        )}

        {/* Quick Stats - Show for both own profile views and visitor view */}
        {Object.keys(groupedSessions).length > 0 && (
          <HStack gap={8} wrap="wrap" justify="center" fontSize="sm">
            <VStack gap={1}>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {stats.upcoming}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                {!isOwnProfile
                  ? "Available"
                  : viewMode === "my-sessions"
                    ? "Upcoming"
                    : "To Attend"}
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

            {/* Booking stats - ONLY for mentor view on own profile */}
            {isOwnProfile && viewMode === "my-sessions" && (
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
              No Sessions Found
            </Text>
            <Text fontSize="sm" color="fg.muted" mb={4}>
              {!isOwnProfile
                ? "This mentor has no available sessions at the moment"
                : viewMode === "my-sessions"
                  ? "Create your first session to get started"
                  : "Book a session with a mentor to see it here"}
            </Text>
            {isOwnProfile && viewMode === "my-sessions" && user?.is_mentor && (
              <Button size="sm" onClick={() => {
                window.location.href = `/profile/${user.uuid}?st=sessions&sessionModal=create`;
              }}>
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
            viewMode={isOwnProfile ? viewMode : undefined}
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
            showActions={isOwnProfile && viewMode === "my-sessions"} // Actions only for own mentor sessions
          />
        )}
      </VStack>
    </Container>
  );
};

export default MentorshipCalendarContent;