import {
  Box,
  Flex,
  Text,
  Button,
  Badge,
  HStack,
  VStack,
  Icon,
  IconButton,
  Menu,
} from "@chakra-ui/react";
import { LuPencil, LuTrash2, LuCalendar, LuClock, LuEyeOff, LuEye, LuLock } from "react-icons/lu";
import { BsThreeDotsVertical } from "react-icons/bs";
import { isValid, parseISO, format, isPast, /*isFuture*/ } from "date-fns";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { useUserById } from "@/hooks/public/useProfile";
import type { MentorSessionPublic } from "@/client";
import { formatDuration } from "@/utils/calendarDataTransformer";
import { useToggleSessionPublic } from "@/hooks/mentor/useToggleSessionPublic";
import { Switch } from "@/components/ui";
import { Link, useNavigate } from "@tanstack/react-router";
import useToaster from "@/hooks/public/useToaster";
import { FaShareSquare } from "react-icons/fa";
import { FaVideo } from "react-icons/fa6";

interface SessionCardProps {
  session: MentorSessionPublic;
  onEdit?: (session: MentorSessionPublic) => void;
  onDelete?: (session: MentorSessionPublic) => void;
  onViewDetails?: (session: MentorSessionPublic) => void;
  showActions: boolean;
  isFromExplore?: boolean;
  isSmall?: boolean;
}

const SessionCard: React.FC<SessionCardProps> = ({
  isSmall = false,
  session,
  onEdit,
  onDelete,
  onViewDetails,
  showActions = false,
  isFromExplore = false,
}) => {
  const navigate = useNavigate()
  const toaster = useToaster()

  const { data: mentorProfileData, isLoading: mentorLoading } = useUserById(
    session.mentor_id
  );
  const { togglePublic, isToggling } = useToggleSessionPublic();

  const startDate = session.start_time ? parseISO(session.start_time) : null;
  const endDate = session.end_time ? parseISO(session.end_time) : null;

  // Determine session status
  const isSessionPast = endDate ? isPast(endDate) : false;
  // const isSessionUpcoming = startDate ? isFuture(startDate) : false;
  const isSessionCancelled = session.is_cancelled || !session.is_active;
  const isFull = session.is_full;
  const spotsLeft = session.available_spots || 0;
  const isUserBooked = session.user_has_booked || false;
  const isUserCancelledByMentor = session.user_cancelled_by_mentor || false;

  const bookingStatus = session?.user_booking_status
  const isUserPending = bookingStatus === "pending"
  const isUserConfirmed = bookingStatus === "confirmed"

  // Session can be booked if: upcoming, not cancelled, not full, and public
  // const canBook = isSessionUpcoming && !isSessionCancelled && !isFull && session.is_public;

  // Determine if card should be dimmed
  const shouldDim = isSessionPast || isSessionCancelled;

  const confirmedBookings =
    session.bookings?.filter((b) => b.status === "confirmed") || [];
  const pendingCount =
    session.bookings?.filter((b) => b.status === "pending").length || 0;

  // Get session status badge
  const getSessionStatusBadge = () => {
    if (isSessionCancelled) {
      return (
        <Badge size="sm" colorPalette="red" variant="solid">
          Cancelled
        </Badge>
      );
    }
    if (isSessionPast) {
      return (
        <Badge size="sm" colorPalette="gray" variant="solid">
          Completed
        </Badge>
      );
    }
    if (!session.is_active) {
      return (
        <Badge size="sm" colorPalette="orange" variant="solid">
          Inactive
        </Badge>
      );
    }
    if (!session.is_public && showActions) {
      return (
        <Badge colorPalette="purple" variant="surface" size="sm">
          <HStack gap={1}>
            <LuLock size={12} />
            <Text>Private</Text>
          </HStack>
        </Badge>
      );
    }
    return null;
  };

  // Get button text and color
  const getBookingButtonProps = () => {
    if (isSessionPast) {
      return {
        text: "Session Ended",
        colorPalette: "gray",
        disabled: true,
      };
    }
    if (isSessionCancelled) {
      return {
        text: "Cancelled",
        colorPalette: "gray",
        disabled: true,
      };
    }
    if (isFull) {
      return {
        text: "Fully Booked",
        colorPalette: "gray",
        disabled: true,
      };
    }
    if (!session.is_public && !showActions) {
      return {
        text: "Private Session",
        colorPalette: "gray",
        disabled: true,
      };
    }
    if (showActions) {
      return {
        text: "View Details",
        colorPalette: "blue",
        disabled: false,
      };
    }
    if (isUserBooked && isUserConfirmed) {
      return {
        text: "Booked",
        colorPalette: "green",
      };
    }
    if (isUserPending) {
      return {
        text: "Pending...",
        colorPalette: "orange",
      };
    }
    if (isUserCancelledByMentor) {
      return {
        text: "Cancelled by Mentor",
        colorPalette: "red",
        disabled: true,
      };
    }
    return {
      text: "Reserve Spot",
      colorPalette: "green",
      disabled: false,
    };
  };

  const bookingButtonProps = getBookingButtonProps();

  const content = (
    <HStack gap={2} align="start" mb={isSmall ? 1 : 2}>
      <Avatar
        src={mentorProfileData?.avatar_url ?? "/fallback.jpg"}
        border={isSmall ? "1px solid white" : ""}
        name={mentorProfileData?.full_name}
        size={{ base: isSmall ? "xs" : "sm", md: isSmall ? "sm" : "md" }}
      />
      <VStack align="start" gap={0} flex={1}>
        <Text fontSize={{ base: isSmall ? "xs" : "sm", md: isSmall ? "sm" : "md" }} fontWeight="semibold" color="white">
          {mentorLoading ? "..." : mentorProfileData?.full_name}
        </Text>
        <Text fontSize={isSmall ? "2xs" : "xs"} color="gray.300" lineClamp={1}>
          {mentorProfileData?.profile?.title}
        </Text>
      </VStack>
    </HStack>
  );

  return (
    <Box
      w="full"
      maxW={"450px"}
      h="full"
      position="relative"
      rounded="lg"
      overflow="hidden"
      bgImage={session.cover_image ? `url('${session.cover_image}')` : undefined}
      bg={!session.cover_image ? "blackAlpha.200" : undefined}
      bgSize="cover"
      border="1px solid"
      borderColor="border.emphasized"
      opacity={shouldDim ? 0.6 : 1}
      transition="opacity 0.2s"
      filter={shouldDim ? "grayscale(0.5)" : "none"}
    >
      {/* Dark overlay - slightly darker for past sessions */}
      <Box
        position="absolute"
        inset={0}
        bg={
          shouldDim
            ? "blackAlpha.800"
            : session.cover_image
              ? "blackAlpha.600"
              : "blackAlpha.200"
        }
      />

      {/* Content */}
      <Flex
        position="relative"
        direction="column"
        h="full"
        px={{ base: 2, md: 3 }}
        py={1}
        zIndex={1}
      >
        {/* Header: Attendees + Timer + Menu */}
        <Flex justify="space-between" align="center" mb={4}>
          {/* Left side - Attendees */}
          {confirmedBookings && confirmedBookings.length > 0 ? (
            <>
              <AvatarGroup size={{ base: "xs", md: "sm" }}>
                {confirmedBookings.slice(0, 3).map((booking, i) => (
                  <Avatar
                    key={i}
                    src={booking.mentee?.avatar_url || "https://via.placeholder.com/150"}
                    name={booking.mentee?.full_name || `Participant ${booking.id}`}
                    border="1px solid white"
                    size={isSmall ? "2xs" : "xs"}
                  />
                ))}
              </AvatarGroup>
              {confirmedBookings.length > 3 && (
                <Text fontSize={isSmall ? "2xs" : "xs"} color="white">
                  +{confirmedBookings.length - 3}
                </Text>
              )}
            </>
          ) : (
            <Box />
          )}

          {/* Right side - Timer Badge + Menu */}
          <HStack gap={2}>
            {/* Date/Time Badge */}
            <Badge
              py={1}
              px={2}
              fontSize={isSmall ? "9px" : "2xs"}
              fontWeight="semibold"
              colorPalette={isSessionPast ? "gray" : "green"}
              variant="subtle"
              outline="1px solid"
            >
              <HStack gap={3}>
                <HStack gap={1}>
                  <LuCalendar size={14} />
                  <Text>
                    {startDate && isValid(startDate)
                      ? format(startDate, "MMM d, yyyy")
                      : "--"}
                  </Text>
                </HStack>
                <HStack gap={1} color="fg.muted">
                  <LuClock size={14} />
                  <Text>
                    {startDate && isValid(startDate) ? format(startDate, "h:mm a") : "--"}
                    {showActions && endDate && isValid(endDate)
                      ? ` - ${format(endDate, "h:mm a")}`
                      : ""}
                  </Text>
                </HStack>
              </HStack>
            </Badge>

            {/* Menu (Owner only) */}
            {showActions && (
              <Menu.Root positioning={{ placement: "bottom-end" }}>
                <Menu.Trigger asChild>
                  <IconButton
                    size={isSmall ? "2xs" : "sm"}
                    variant="ghost"
                    aria-label="More options"
                    color="white"
                    _hover={{ bg: "whiteAlpha.200" }}
                  >
                    <BsThreeDotsVertical />
                  </IconButton>
                </Menu.Trigger>

                <Menu.Positioner>
                  <Menu.Content minW="180px">
                    <Menu.Item
                      value="share"
                      onClick={() => {
                        const url = `${window.location.origin}/profile/${mentorProfileData?.uuid}?pt=about&st=sessions&sessionDetailId=${session.uuid}`

                        if (navigator.share) {
                          // Native system share sheet
                          navigator.share({
                            title: session.title,
                            text: `Check out this session by ${mentorProfileData?.full_name}`,
                            url,
                          })
                        } else {
                          // Fallback for browsers that don't support it (most desktops)
                          navigator.clipboard.writeText(url)
                          toaster({ id: "link_copied", title: "Link copied!", status: "info" })
                        }
                      }}
                    >
                      <FaShareSquare />
                      Share
                    </Menu.Item>

                    {/* Edit - disabled for past sessions */}
                    <Menu.Item
                      value="edit"
                      onClick={() => onEdit?.(session)}
                    // disabled={isSessionPast}
                    >
                      <LuPencil />
                      Edit Session
                    </Menu.Item>

                    {/* Toggle Public/Private - disabled for past sessions */}
                    {!isSessionPast && (
                      <Menu.Item
                        value="isPublic"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!isSessionPast) togglePublic(session);
                        }}
                        cursor={isSessionPast ? "not-allowed" : "pointer"}
                        disabled={isSessionPast}
                        opacity={isSessionPast ? 0.5 : 1}
                      >
                        <HStack justify="space-between" w="full" gap={3}>
                          <HStack gap={2}>
                            <Icon
                              as={session.is_public ? LuEye : LuEyeOff}
                              boxSize={5}
                              color={session.is_public ? "green.500" : "gray.400"}
                            />
                            <Text fontSize="sm" color="fg.muted">
                              {session.is_public ? "Public" : "Private"}
                            </Text>
                          </HStack>

                          <Switch
                            size="sm"
                            checked={session.is_public ?? false}
                            disabled={isToggling || isSessionPast}
                            colorPalette={session.is_public ? "green" : "gray"}
                            onChange={() => togglePublic(session)}
                          />
                        </HStack>
                      </Menu.Item>
                    )}

                    <Menu.Separator />

                    {/* Delete/Cancel - different text for past sessions */}
                    <Menu.Item
                      value="delete"
                      color="red.500"
                      onClick={() => onDelete?.(session)}
                    >
                      <LuTrash2 />
                      {isSessionPast ? "Delete Session" : "Cancel Session"}
                    </Menu.Item>

                    <Menu.Arrow />
                  </Menu.Content>
                </Menu.Positioner>
              </Menu.Root>
            )}
          </HStack>
        </Flex>

        {/* Spacer */}
        <Box flex={1} />

        {/* Mentor Info */}
        <Box mb={3}>
          {!showActions && mentorProfileData?.uuid ? (
            <Link
              to="/profile/$uuid"
              params={{ uuid: mentorProfileData.uuid }}
              search={{
                pt: 'about',
                st: 'sessions',
                drawer: undefined,
                step: undefined,
                redirectTo: undefined,
                serviceModal: undefined,
                serviceId: undefined,
                serviceDetailId: undefined,
                sessionModal: undefined,
                sessionId: undefined,
                sessionDetailId: undefined,
                settings: undefined,
              }}
            >
              {content}
            </Link>
          ) : (
            content
          )}

          <HStack justify="space-between" align="start" gap={2}>
            <Text
              fontSize={{ base: isSmall ? "sm" : "md", md: isSmall ? "md" : "lg" }}
              fontWeight="bold"
              color="white"
              lineClamp={isSmall ? 1 : 2}
              flex={1}
            >
              {session.title}
            </Text>
            {getSessionStatusBadge()}
            {/* Pending Badge (Owner only, not for past sessions) */}
            {showActions && pendingCount > 0 && !isSessionPast && (
              <Badge
                colorPalette="orange"
                variant="solid"
                size={isSmall ? "xs" : "sm"}
                rounded="sm"
              >
                {pendingCount} pending
              </Badge>
            )}

            {isUserBooked && isUserConfirmed && session.is_active && (
              <Button
                size={isSmall ? "2xs" : "xs"}
                colorPalette="blue"
                onClick={() => {
                  if (session.meeting_link) {
                    window.open(session.meeting_link, "_blank");
                  }
                }}
              >
                <HStack gap={1}>
                  <Text fontSize={isSmall ? "2xs" : "sm"}>
                    <FaVideo />
                  </Text>

                  <Text fontSize={isSmall ? "2xs" : "sm"}>
                    Join Session
                  </Text>
                </HStack>
              </Button>
            )}
          </HStack>
        </Box>

        {/* Booking Section */}
        <Box
          bg="whiteAlpha.900"
          _dark={{ bg: "blackAlpha.800" }}
          py={isSmall ? 1 : 2}
          px={3}
          borderRadius="lg"
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor="whiteAlpha.300"
        >
          <Text fontSize="xs" fontWeight="medium" color="fg.muted">
            Session {isSessionPast ? "Summary" : "Availability"}
          </Text>

          <Flex justify="space-between" align="center">
            <Box flex={1}>
              <Text fontWeight="bold" fontSize={{ base: isSmall ? "sm" : "md", md: isSmall ? "md" : "lg" }}>
                {session.confirmed_bookings || 0} / {session.max_bookings || 0} {isSessionPast ? "Attended" : "Booked"}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                {isSessionPast
                  ? "Session completed"
                  : isSessionCancelled
                    ? "Session cancelled"
                    : isFull
                      ? "Session is full"
                      : `${spotsLeft} ${spotsLeft === 1 ? "spot" : "spots"} left`}
              </Text>
            </Box>

            <VStack align="end" gap={1} alignItems={'center'}>
              <HStack fontSize={isSmall ? "sm" : "md"} color="fg.muted">
                <Text fontWeight="medium">{formatDuration(session.duration_minutes)}</Text>
                <Text>•</Text>
                <Text fontWeight="semibold">
                  {session.price_usd ? `$${session.price_usd}` : "Free"}
                </Text>
              </HStack>

              <Button
                size={isSmall ? "xs" : "sm"}
                colorPalette={bookingButtonProps.colorPalette}
                title={"View details"}
                rounded={isSmall ? "xl" : "full"}
                fontWeight="semibold"
                disabled={bookingButtonProps.disabled}
                onClick={
                  isFromExplore ? (
                    () => navigate({
                      to: `/profile/${mentorProfileData?.uuid}`,
                      search: {
                        pt: 'about',
                        st: 'sessions',
                        sessionDetailId: session.uuid
                      }
                    })
                  ) : (
                    () => !bookingButtonProps.disabled && onViewDetails?.(session)
                  )
                }
                w="100%"
                cursor={bookingButtonProps.disabled ? "not-allowed" : "pointer"}
              >
                {bookingButtonProps.text}
              </Button>
            </VStack>
          </Flex>
        </Box>
      </Flex >
    </Box >
  );
};

export default SessionCard;