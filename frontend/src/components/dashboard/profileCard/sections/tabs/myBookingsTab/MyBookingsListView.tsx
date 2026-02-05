import { useState, useMemo } from "react";
import {
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Spinner,
  Box,
  SimpleGrid,
  Badge,
  Flex,
  Menu,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useMentorBookings } from "@/hooks/mentor/useMentorBookings";
import type { BookingPublic } from "@/client";
import SessionCard from "@/components/dashboard/mentor/sessions/SessionCard";
import { useRouter } from "@tanstack/react-router";

interface MyBookingsListViewProps {
  onViewSession?: (booking: BookingPublic) => void;
  onCancelBooking?: (booking: BookingPublic) => void;
  onEdit?: (session: BookingPublic) => void;
  isOwnProfile?: boolean;
}

const MyBookingsListView: React.FC<MyBookingsListViewProps> = ({
  onViewSession,
  onCancelBooking,
  onEdit,
  isOwnProfile = false,
}) => {
  const router = useRouter();
  const { bookings, isLoading } = useMentorBookings();
  const [filter, setFilter] = useState<"all" | "upcoming" | "past" | "cancelled">("all");

  const isSessionCardSmall = useBreakpointValue({ base: false, md: true })

  // Find THE NEXT session (most important for user)
  const nextSession = useMemo(() => {
    if (!bookings) return null;

    const now = new Date();
    const upcomingSessions = bookings
      .filter(booking => {
        if (!booking.session) return false;
        const sessionStart = new Date(booking.session.start_time);
        const isCancelled = booking.status === "cancelled_by_mentor" || booking.status === "cancelled_by_mentee";
        return sessionStart > now && !isCancelled;
      })
      .sort((a, b) => {
        const aTime = new Date(a.session!.start_time).getTime();
        const bTime = new Date(b.session!.start_time).getTime();
        return aTime - bTime;
      });

    return upcomingSessions[0] || null;
  }, [bookings]);

  // Process and filter bookings
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];

    const now = new Date();

    return bookings
      .filter(booking => {
        if (!booking.session) return false;

        const sessionStart = new Date(booking.session.start_time);
        const sessionEnd = new Date(booking.session.end_time);
        const isCancelled = booking.status === "cancelled_by_mentor" || booking.status === "cancelled_by_mentee";
        const isPast = sessionEnd < now;
        const isUpcoming = sessionStart > now && !isCancelled;

        switch (filter) {
          case "upcoming":
            return isUpcoming;
          case "past":
            return isPast && !isCancelled;
          case "cancelled":
            return isCancelled;
          case "all":
          default:
            return true;
        }
      })
      .sort((a, b) => {
        const aTime = new Date(a.session!.start_time).getTime();
        const bTime = new Date(b.session!.start_time).getTime();
        return filter === "past" ? bTime - aTime : aTime - bTime;
      });
  }, [bookings, filter]);

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

  // Get time until next session
  const getTimeUntilSession = (sessionTime: string) => {
    const now = new Date();
    const session = new Date(sessionTime);
    const diff = session.getTime() - now.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'starting soon!';
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
        {/* NEXT SESSION HIGHLIGHT - Most important! */}
        {/* NEXT SESSION HIGHLIGHT - Most important! */}
        {nextSession && filter === "upcoming" && (
          <Box
            p={4}
            bg="linear-gradient(135deg, blue.500 0%, purple.500 100%)"
            borderRadius="xl"
            position="relative"
            overflow="hidden"
          >
            {/* Decorative background pattern */}
            <Box
              position="absolute"
              top="-50%"
              right="-10%"
              width="300px"
              height="300px"
              borderRadius="full"
              bg="whiteAlpha.100"
            />

            <VStack align="stretch" gap={3} position="relative" zIndex={1}>
              <HStack justify="space-between" width="100%">
                <Badge colorPalette="green" size="sm" bg="green.400" color="white">
                  ⚡ Next Session
                </Badge>
                <Text fontSize="xs" fontWeight="medium" color="white" opacity={0.9}>
                  {getTimeUntilSession(nextSession.session!.start_time)}
                </Text>
              </HStack>

              <SessionCard
                isSmall={isSessionCardSmall}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                session={nextSession.session as any}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onEdit={onEdit as any}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onDelete={onCancelBooking as any}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onViewDetails={onViewSession as any}
                showActions={!isOwnProfile}
              />
            </VStack>
          </Box>
        )}

        {/* WHAT TO DO NEXT - Guidance based on state */}
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
                  🎯 Ready to start learning?
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
                      view: "mentors",
                    }
                  });
                }}
              >
                Explore Mentors
              </Button>
            </VStack>
          </Box>
        )}

        {stats.upcoming === 0 && stats.past > 0 && filter === "upcoming" && (
          <Box
            p={5}
            bg={{ base: "blue.50", _dark: "blue.950" }}
            borderRadius="lg"
            borderLeft="4px solid"
            borderColor="blue.400"
          >
            <VStack align="start" gap={2}>
              <Text fontSize="lg" fontWeight="semibold">
                📅 No upcoming sessions
              </Text>

              <Text fontSize="sm" color="fg.muted">
                You've completed {stats.past} session{stats.past > 1 ? 's' : ''}. Ready for more?
              </Text>

              <Button
                size="sm"
                colorPalette="blue"
                onClick={() => router.navigate({
                  to: "/explore",
                  search: {
                    view: "sessions",
                  }
                })}
              >
                Book Another Session
              </Button>
            </VStack>
          </Box>
        )}

        <Flex
          direction={{ base: "row", md: "row" }}
          align="center"
          justify={{ base: "space-between", md: "center" }}
          gap={{ base: 4, md: 8 }}
          fontSize="sm"
          position="relative"
        >
          {/* Stats Overview */}
          {stats.total > 0 && (
            <HStack gap={{ base: 5, md: 8 }} wrap="wrap" justify="center" fontSize="sm">
              <VStack gap={1}>
                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="blue.500">
                  {stats.upcoming}
                </Text>
                <Text fontSize={{ base: "2xs", md: "xs" }} color="fg.muted">
                  To Attend
                </Text>
              </VStack>

              <VStack gap={1}>
                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="green.500">
                  {stats.past}
                </Text>
                <Text fontSize={{ base: "2xs", md: "xs" }} color="fg.muted">
                  Completed
                </Text>
              </VStack>

              {stats.cancelled > 0 && (
                <VStack gap={1}>
                  <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="gray.500">
                    {stats.cancelled}
                  </Text>
                  <Text fontSize={{ base: "2xs", md: "xs" }} color="fg.muted">
                    Cancelled
                  </Text>
                </VStack>
              )}

              <VStack gap={1}>
                <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="purple.500">
                  {stats.total}
                </Text>
                <Text fontSize={{ base: "2xs", md: "xs" }} color="fg.muted">
                  Total Bookings
                </Text>
              </VStack>
            </HStack>
          )}

          {/* Filter Menu */}
          {stats.total > 0 && (
            <Box
              alignSelf={{ base: "flex-end", md: "center" }}
              position={{ base: "static", md: "absolute" }}
              right={{ base: "auto", md: 0 }}
            >
              <Menu.Root positioning={{ placement: "bottom-end" }}>
                <Menu.Trigger asChild>
                  <Button size={{ base: "xs", md: "sm" }} variant="outline">
                    {filter === "upcoming" && `Upcoming (${stats.upcoming})`}
                    {filter === "past" && `Past (${stats.past})`}
                    {filter === "cancelled" && `Cancelled (${stats.cancelled})`}
                    {filter === "all" && `All (${stats.total})`}
                  </Button>
                </Menu.Trigger>

                <Menu.Positioner>
                  <Menu.Content minW="180px">

                    <Menu.Item
                      value="all"
                      onClick={() => setFilter("all")}
                      color={filter === "all" ? "purple.500" : undefined}
                    >
                      All ({stats.total})
                    </Menu.Item>

                    <Menu.Separator />

                    <Menu.Item
                      value="upcoming"
                      onClick={() => setFilter("upcoming")}
                      color={filter === "upcoming" ? "blue.500" : undefined}
                    >
                      Upcoming ({stats.upcoming})
                    </Menu.Item>

                    <Menu.Item
                      value="past"
                      onClick={() => setFilter("past")}
                      color={filter === "past" ? "green.500" : undefined}
                    >
                      Past ({stats.past})
                    </Menu.Item>

                    {stats.cancelled > 0 && (
                      <Menu.Item
                        value="cancelled"
                        onClick={() => setFilter("cancelled")}
                        color={filter === "cancelled" ? "gray.500" : undefined}
                      >
                        Cancelled ({stats.cancelled})
                      </Menu.Item>
                    )}
                    <Menu.Arrow />
                  </Menu.Content>
                </Menu.Positioner>
              </Menu.Root>
            </Box>
          )}
        </Flex>

        {/* Bookings List */}
        {filteredBookings.length > 0 && (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
            {filteredBookings.map((booking) => (
              <SessionCard
                isSmall={isSessionCardSmall}
                key={booking.id}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                session={booking.session as any}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onEdit={onEdit as any}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onDelete={onCancelBooking as any}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onViewDetails={onViewSession as any}
                showActions={!isOwnProfile}
              />
            ))}
          </SimpleGrid>
        )}

        {/* No results for current filter */}
        {stats.total > 0 && filteredBookings.length === 0 && (
          <Box
            p={5}
            bg={{
              base: filter === "upcoming" ? "blue.50" : filter === "past" ? "green.50" : filter === "cancelled" ? "gray.50" : "purple.50",
              _dark: filter === "upcoming" ? "blue.950" : filter === "past" ? "green.950" : filter === "cancelled" ? "gray.950" : "purple.950"
            }}
            borderRadius="lg"
            borderLeft="4px solid"
            borderColor={
              filter === "upcoming" ? "blue.400" :
                filter === "past" ? "green.400" :
                  filter === "cancelled" ? "gray.400" :
                    "purple.400"
            }
          >
            <VStack align="start" gap={2}>
              {/* UPCOMING - No upcoming sessions */}
              {filter === "upcoming" && (
                <>
                  <Text fontSize="lg" fontWeight="semibold">
                    📅 No upcoming sessions
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    {stats.past > 0
                      ? `You've completed ${stats.past} session${stats.past > 1 ? 's' : ''}. Ready to book another?`
                      : "Book your first session to start learning!"
                    }
                  </Text>
                  <Button
                    size="sm"
                    colorPalette="blue"
                    onClick={() => router.navigate({
                      to: "/explore",
                      search: {
                        view: "sessions",
                      }
                    })}
                  >
                    Browse Sessions
                  </Button>
                </>
              )}

              {/* PAST - No completed sessions */}
              {filter === "past" && (
                <>
                  <Text fontSize="lg" fontWeight="semibold">
                    📚 No completed sessions yet
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    {stats.upcoming > 0
                      ? `You have ${stats.upcoming} upcoming session${stats.upcoming > 1 ? 's' : ''}. Completed sessions will appear here after they're done.`
                      : "Complete your first session to see it here!"
                    }
                  </Text>
                  {stats.upcoming === 0 && (
                    <Button
                      size="sm"
                      colorPalette="green"
                      onClick={() => router.navigate({
                        to: "/explore",
                        search: {
                          view: "sessions",
                        }
                      })}
                    >
                      Book a Session
                    </Button>
                  )}
                </>
              )}

              {/* CANCELLED - No cancelled sessions */}
              {filter === "cancelled" && (
                <>
                  <Text fontSize="lg" fontWeight="semibold">
                    ✅ No cancelled sessions
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    Great! All your sessions are active. Keep up the momentum!
                  </Text>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFilter("upcoming")}
                  >
                    View Upcoming Sessions
                  </Button>
                </>
              )}

              {/* ALL - This shouldn't happen, but just in case */}
              {filter === "all" && (
                <>
                  <Text fontSize="lg" fontWeight="semibold">
                    🔍 No bookings found
                  </Text>
                  <Text fontSize="sm" color="fg.muted">
                    Something's not right. Try refreshing the page.
                  </Text>
                </>
              )}
            </VStack>
          </Box>
        )}



      </VStack>
    </Container>
  );
};

export default MyBookingsListView;