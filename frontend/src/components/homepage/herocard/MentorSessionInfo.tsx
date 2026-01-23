import {
  Box,
  Flex,
  Text,
  Button,
  Badge,
  HStack,
  VStack,
  Drawer,
  IconButton,
  CloseButton,
  Portal,
  useDisclosure,
} from '@chakra-ui/react';
import { AvatarGroup, Avatar } from '@/components/ui';
import InfoPanelContent, { DrawerContainer } from './InfoPanelContent';
import { LuCalendar, LuClock, LuInfo } from 'react-icons/lu';
import { useRef } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import type { BookingPublic, MentorSessionPublic, UserPublic } from '@/client';
import { parseISO, isValid, format, isPast } from 'date-fns';
import { formatDurationMin } from '@/utils/calendarDataTransformer';
import { Link, useNavigate } from '@tanstack/react-router';

interface MentorSessionInfoProps {
  session: MentorSessionPublic;
  confirmedBookings: BookingPublic[];
  mentorData?: UserPublic;
  onPrevious: () => void;
  onNext: () => void;
  currentIndex: number;
  totalSlides: number;
  isMobileLayout?: boolean;
}

const MentorSessionInfo: React.FC<MentorSessionInfoProps> = ({
  session,
  confirmedBookings,
  mentorData,
  onPrevious,
  onNext,
  currentIndex,
  totalSlides,
  isMobileLayout,
}) => {
  const portalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { open, onOpen, onClose } = useDisclosure();

  const startDate = session.start_time ? parseISO(session.start_time) : null;
  const endDate = session.end_time ? parseISO(session.end_time) : null;
  const isSessionPast = endDate ? isPast(endDate) : false;
  const isFull = session.is_full;
  const spotsLeft = session.available_spots || 0;

  return (
    <Drawer.Root open={open} onOpenChange={(val) => !val && onClose()}>
      {/* Drawer content container */}
      <DrawerContainer ref={portalRef}>
        <Box
          w="full"
          h="full"
          p={{ base: 3, md: 4 }}
          position="relative"
          display="flex"
          flexDirection="column"
          bgImage={
            session.cover_image
              ? `url(${session.cover_image})`
              : mentorData?.cover_image
                ? `url(${mentorData.cover_image})`
                : mentorData?.avatar_url
                  ? `url(${mentorData.avatar_url})`
                  : undefined
          }
          bgSize="cover"
          bgRepeat="no-repeat"
          overflow="hidden"
          rounded="lg"
        >
          {/* Dark overlay */}
          <Box position="absolute" inset={0} bg="blackAlpha.600" zIndex={1} />

          {/* Main content */}
          <Box position="relative" zIndex={2} flex="1" display="flex" flexDirection="column">
            {/* Top section */}
            <Flex justify="space-between" align="center" mb={{ base: 3, md: 4 }}>
              {/* Avatars */}
              {confirmedBookings.length > 0 ? (
                <AvatarGroup size={{ base: 'xs', md: 'sm' }}>
                  {confirmedBookings.slice(0, 3).map((booking, idx) => (
                    <Avatar
                      key={idx}
                      src={booking.mentee?.avatar_url ?? "/fallbacl.jpg"}
                      name={booking.mentee?.full_name || `Participant ${booking.id}`}
                      border="1px solid white"
                    />
                  ))}
                </AvatarGroup>
              ) : (
                <Box />
              )}

              <HStack gap={{ base: 1, md: 2 }}>
                {/* Date/Time Badge */}
                <Badge
                  py={1}
                  fontWeight="semibold"
                  colorPalette={isSessionPast ? 'gray' : 'green'}
                  variant="subtle"
                  outline="1px solid"
                  size={{ base: 'xs', md: 'sm' }}
                >
                  <HStack gap={3}>
                    <HStack gap={1}>
                      <LuCalendar size={14} />
                      <Text>
                        {startDate && isValid(startDate) ? format(startDate, 'MMM d, yyyy') : '--'}
                      </Text>
                    </HStack>
                    <HStack gap={1} color="fg.muted">
                      <LuClock size={14} />
                      <Text>{startDate && isValid(startDate) ? format(startDate, 'h:mm a') : '--'}</Text>
                    </HStack>
                  </HStack>
                </Badge>

                {/* Info button (mobile only) */}
                {isMobileLayout && (
                  <IconButton
                    size="2xs"
                    variant="outline"
                    bg="whiteAlpha.200"
                    color="white"
                    _hover={{ bg: 'whiteAlpha.300' }}
                    onClick={onOpen}
                    aria-label="More Info"
                  >
                    <LuInfo />
                  </IconButton>
                )}
              </HStack>
            </Flex>

            {/* Spacer */}
            <Box flex={1} />

            {/* Mentor info + session title */}
            <Box mb={{ base: 3, md: 4 }}>
              <Link to={`/profile/$uuid`} params={{ uuid: mentorData?.uuid || '' }}>
                <HStack gap={2} align="start" mb={{ base: 2, md: 3 }}>
                  <Avatar src={mentorData?.avatar_url ?? "/fallback.jpg"} name={mentorData?.full_name} size={{ base: 'sm', md: 'md' }} />
                  <VStack align="start" gap={0}>
                    <Text fontSize={{ base: 'sm', md: 'lg' }} fontWeight="bold" color="white" truncate>
                      {mentorData?.full_name}
                    </Text>
                    <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.300" lineClamp={{ base: 1, md: 2 }}>
                      {mentorData?.profile?.title}
                    </Text>
                  </VStack>
                </HStack>
              </Link>

              <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" mb={1} color="gray.50" truncate>
                {session.title}
              </Text>
            </Box>

            {/* Booking section */}
            <Box
              bg={{ base: 'whiteAlpha.700', _dark: 'blackAlpha.600' }}
              p={{ base: 3, md: 4 }}
              borderRadius="lg"
              backdropFilter="blur(4px)"
              position="relative"
              border="1px solid"
              borderColor={"border.emphasized"}
            >
              {/* Navigation Arrows */}
              {totalSlides > 1 && (
                <Box position="absolute" top={2} right={2}>
                  <HStack gap={2}>
                    <IconButton size={{ base: '2xs', md: 'xs' }} variant="subtle" border="1px solid" borderRadius="md" onClick={onPrevious}><FaArrowLeft /></IconButton>
                    <IconButton size={{ base: '2xs', md: 'xs' }} variant="subtle" border="1px solid" borderRadius="md" onClick={onNext}><FaArrowRight /></IconButton>
                  </HStack>
                </Box>
              )}

              {/* Carousel Indicators */}
              {totalSlides > 1 && (
                <Box position="absolute" bottom={1} left={3}>
                  <HStack gap={1}>
                    {Array.from({ length: totalSlides }).map((_, idx) => (
                      <Box
                        key={idx}
                        w={1}
                        h={2}
                        borderRadius="full"
                        bg={idx === currentIndex ? 'gray.300' : 'gray.700'}
                        border={"1px solid"}
                        transition="all 0.3s"
                      />
                    ))}
                  </HStack>
                </Box>
              )}

              <Text fontSize={{ base: 'xs', md: 'sm' }} color="fg.muted" mb={2}>
                Session {isSessionPast ? 'Summary' : 'Availability'}
              </Text>

              <Flex direction="row" justify="space-between" align="center" gap={3}>
                <VStack justify="flex-start" align="flex-start">
                  <Text fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }}>
                    {session.confirmed_bookings || 0} / {session.max_bookings || 0}{' '}
                    {isSessionPast ? 'Attended' : 'Booked'}
                  </Text>
                  <Text fontSize={{ base: '2xs', md: 'xs' }} color="fg.muted">
                    {isSessionPast
                      ? 'Session completed'
                      : session.is_cancelled
                        ? 'Session cancelled'
                        : isFull
                          ? 'Session is full'
                          : `${spotsLeft} ${spotsLeft === 1 ? 'spot' : 'spots'} left`}
                  </Text>
                </VStack>

                <VStack align="end" gap={1}>
                  <HStack fontSize="sm" color="fg.muted">
                    <Text fontWeight="medium" lineClamp={1}>
                      {formatDurationMin(session.duration_minutes)}
                    </Text>
                    <Text>•</Text>
                    <Text fontWeight="semibold">{session.price_usd ? `$${session.price_usd}` : 'Free'}</Text>
                  </HStack>

                  <Button
                    size={{ base: 'xs', md: 'sm' }}
                    colorPalette={isFull || isSessionPast ? 'gray' : 'green'}
                    rounded="full"
                    fontWeight="semibold"
                    disabled={isFull || isSessionPast}
                    _hover={{ transform: isFull || isSessionPast ? 'none' : 'scale(1.05)' }}
                    _active={{ transform: isFull || isSessionPast ? 'none' : 'scale(0.98)' }}
                    onClick={() => navigate({
                      to: `/profile/${mentorData?.uuid}`,
                      search: {
                        pt: 'about',
                        st: 'sessions',
                        sessionDetailId: session.uuid
                      }
                    })}
                  >
                    {isSessionPast ? 'Completed' : isFull ? 'Full' : 'Book Now'}
                  </Button>
                </VStack>
              </Flex>
            </Box>
          </Box>
        </Box>
      </DrawerContainer>

      {/* Mobile Drawer */}
      <Portal container={portalRef}>
        {isMobileLayout && (
          <Drawer.Positioner pos="absolute" boxSize="full">
            <Drawer.Backdrop pos="absolute" boxSize="full" bg="blackAlpha.600" />
            <Drawer.Content maxW="full" w="100vw" h="full">
              <Drawer.Body p={0} flex="1" minH="0" overflowY="auto">
                <Box px={{ base: 4, md: 6 }} h="full" pt={2} position="relative">
                  <InfoPanelContent
                    session={session}
                    mentorData={mentorData}
                    confirmedBookings={confirmedBookings}
                    isMobileLayout={isMobileLayout}
                    closeButton={<CloseButton size="sm" variant="outline" onClick={onClose} />}
                  />
                </Box>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        )}
      </Portal>
    </Drawer.Root>
  );
};

export default MentorSessionInfo;
