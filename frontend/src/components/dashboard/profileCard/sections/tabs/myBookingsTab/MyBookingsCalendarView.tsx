import { useState, useMemo } from "react";
import { Container, VStack, HStack, Text, Spinner, Box, Flex, Button } from "@chakra-ui/react";
import { useMentorBookings } from "@/hooks/mentor/useMentorBookings";
import type { BookingPublic, MentorSessionPublic } from "@/client";
import { MentorshipCalendar } from "@/components/dashboard/calendar/MentorshipCalendar";
import { SessionDetails } from "@/components/dashboard/calendar/SessionDetails";
import { useRouter } from "@tanstack/react-router";

interface MyBookingsCalendarViewProps {
  onViewBooking?: (booking: BookingPublic) => void;
  onCancelBooking?: (booking: BookingPublic) => void;
  onEditBooking?: (booking: BookingPublic) => void;
  isOwnProfile?: boolean;
}

const MyBookingsCalendarView: React.FC<MyBookingsCalendarViewProps> = ({
  onViewBooking,
  onCancelBooking,
  onEditBooking,
  isOwnProfile = false,
}) => {
  const router = useRouter();
  const { bookings, isLoading } = useMentorBookings();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedBookings, setSelectedBookings] = useState<BookingPublic[]>([]);

  // Group bookings by date
  const groupedBookings = useMemo(() => {
    if (!bookings) return {};

    const grouped: Record<string, BookingPublic[]> = {};

    bookings.forEach((booking) => {
      if (!booking.session) return;

      const date = new Date(booking.session.start_time).toISOString().split('T')[0];

      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(booking);
    });

    return grouped;
  }, [bookings]);

  // Convert bookings to session format for calendar display
  const sessionsForCalendar = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionsByDate: Record<string, any[]> = {};

    Object.entries(groupedBookings).forEach(([date, dateBookings]) => {
      sessionsByDate[date] = dateBookings.map(booking => booking.session).filter(Boolean);
    });

    return sessionsByDate;
  }, [groupedBookings]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!bookings) return { upcoming: 0, past: 0, cancelled: 0, total: 0 };

    const now = new Date();
    let upcoming = 0;
    let past = 0;
    let cancelled = 0;

    bookings.forEach(booking => {
      if (!booking.session) return;

      const sessionStart = new Date(booking.session.start_time);
      const sessionEnd = new Date(booking.session.end_time);
      const isCancelled = booking.status === "cancelled_by_mentor" || booking.status === "cancelled_by_mentee";

      if (isCancelled) {
        cancelled++;
      } else if (sessionEnd < now) {
        past++;
      } else if (sessionStart > now) {
        upcoming++;
      }
    });

    return {
      upcoming,
      past,
      cancelled,
      total: bookings.length,
    };
  }, [bookings]);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setSelectedBookings(groupedBookings[date] || []);
  };

  const handleCloseDetails = () => {
    setSelectedDate(null);
    setSelectedBookings([]);
  };

  if (isLoading) {
    return (
      <Container maxW="4xl" p={0}>
        <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
          <Spinner size="lg" />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="4xl" p={0}>
      <VStack gap={6} align="stretch">
        {/* Quick Stats */}
        {stats.total > 0 && (
          <HStack gap={8} wrap="wrap" justify="center" fontSize="sm">
            <VStack gap={1}>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {stats.upcoming}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                Upcoming
              </Text>
            </VStack>

            <VStack gap={1}>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {stats.past}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                Completed
              </Text>
            </VStack>

            {stats.cancelled > 0 && (
              <VStack gap={1}>
                <Text fontSize="2xl" fontWeight="bold" color="gray.500">
                  {stats.cancelled}
                </Text>
                <Text fontSize="xs" color="fg.muted">
                  Cancelled
                </Text>
              </VStack>
            )}

            <VStack gap={1}>
              <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                {stats.total}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                Total Bookings
              </Text>
            </VStack>
          </HStack>
        )}

        {/* Empty State */}
        {stats.total === 0 && (
          <Box
            p={5}
            bg={{ base: "orange.50", _dark: "orange.950" }}
            borderRadius="lg"
            borderLeft="4px solid"
            borderColor="orange.400"
          >
            <VStack align="start" gap={2}>
              <HStack>
                <Text fontSize="lg" fontWeight="semibold">
                  📅 No Bookings Yet
                </Text>
              </HStack>
              <Text fontSize="sm" color="fg.muted">
                Browse mentors and book your first session to begin your journey
              </Text>
              <Button
                size="sm"
                onClick={() => {
                  router.navigate({
                    to: "/explore",
                    search: {
                      view: "sessions",
                    }
                  });
                }}
              >
                Explore Sessions
              </Button>
            </VStack>
          </Box>
        )}
        <Flex justify={"center"} w="100%">
          {/* Calendar */}
          {stats.total > 0 && (
            <MentorshipCalendar
              sessions={sessionsForCalendar}
              onDateClick={handleDateClick}
              isOwnProfile={false} // Viewing as mentee
            />
          )}
        </Flex>


        {/* Session Details Modal - showing bookings instead of sessions */}
        {selectedDate && selectedBookings.length > 0 && (
          <SessionDetails
            isOpen={!!selectedDate}
            date={selectedDate}
            sessions={selectedBookings.map(b => b.session!).filter(Boolean) as MentorSessionPublic[]}
            onClose={handleCloseDetails}
            onEdit={onEditBooking ? (session) => {
              // Find the booking that matches this session
              const booking = selectedBookings.find(b => b.session?.id === session.id);
              if (booking) onEditBooking(booking);
            } : undefined}
            onDelete={onCancelBooking ? (session) => {
              const booking = selectedBookings.find(b => b.session?.id === session.id);
              if (booking) onCancelBooking(booking);
            } : undefined}
            onViewDetails={onViewBooking ? (session) => {
              const booking = selectedBookings.find(b => b.session?.id === session.id);
              if (booking) onViewBooking(booking);
            } : undefined}
            showActions={!isOwnProfile}
          />
        )}
      </VStack>
    </Container>
  );
};

export default MyBookingsCalendarView;