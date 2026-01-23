import {
  Box,
  Flex,
  Text,
  Button,
  Badge,
  HStack,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { Tabs } from '@chakra-ui/react';
import { Avatar, Tag } from '@/components/ui';
import { LuUser, LuUsers, LuBookOpen } from 'react-icons/lu';
import React from 'react';
import type { BookingPublic, MentorSessionPublic, UserPublic } from '@/client';
import { format, parseISO, isValid } from 'date-fns';
import PreparationTab from '@/components/dashboard/mentor/sessions/sessionDetails/tabs/PreparationTab';
import { Link } from '@tanstack/react-router';

interface InfoPanelContentProps {
  session: MentorSessionPublic;
  mentorData?: UserPublic;
  confirmedBookings: BookingPublic[];
  closeButton?: React.ReactNode;
  isMobileLayout?: boolean;
}

const InfoPanelContent: React.FC<InfoPanelContentProps> = ({
  session,
  mentorData,
  confirmedBookings,
  closeButton,
  isMobileLayout,
}) => {
  const avs = { base: 'gray.100', _dark: 'gray.700' };
  const isMobile = useBreakpointValue({ base: true, md: false });

  const startDate = session.start_time ? parseISO(session.start_time) : null;
  const isFull = session.is_full;

  return (
    <Box
      display="flex"
      flexDirection="column"
      h="full"
      p={isMobileLayout || isMobile ? 0 : 6}
      position="relative"
    >
      {/* Close button for mobile */}
      {closeButton && (isMobile || isMobileLayout) && (
        <Box position="absolute" top={0} right={2} zIndex={2}>
          {closeButton}
        </Box>
      )}

      <Tabs.Root
        defaultValue="details"
        display="flex"
        flexDirection="column"
        flex="1"
        minH="0"
      >
        {/* Tab triggers */}
        <Tabs.List mb={{ base: 1, md: 4 }} overflowX="auto">
          <Tabs.Trigger value="details">
            <HStack fontSize={{ base: "xs", md: "sm" }}>
              <Box hideBelow="sm">
                <LuUser />
              </Box>
              Details
            </HStack>
          </Tabs.Trigger>
          <Tabs.Trigger value="members">
            <HStack fontSize={{ base: "xs", md: "sm" }}>
              <Box hideBelow="sm">
                <LuUsers />
              </Box>
              Mentees ({confirmedBookings.length})
            </HStack>
          </Tabs.Trigger>
          {session.preparation_materials && session.preparation_materials.length > 0 && (
            <Tabs.Trigger value="prep">
              <HStack fontSize={{ base: "xs", md: "sm" }}>
                <Box hideBelow="sm">
                  <LuBookOpen />
                </Box>
                Preparation
              </HStack>
            </Tabs.Trigger>
          )}
          <Tabs.Indicator />
        </Tabs.List>

        {/* Details Tab */}
        <Tabs.Content value="details" flex="1" minH="0" overflowY="auto">
          <VStack align="start" gap={{ base: 2, md: 4 }}>
            {/* Session date */}
            <HStack gap={2}>
              <Text fontSize={{ base: "xs", md: "sm" }}>
                {startDate && isValid(startDate)
                  ? format(startDate, "MMM d, yyyy 'at' h:mm a")
                  : '--'}
              </Text>
              {isMobile && isFull && (
                <Tag bg="bg.warning">
                  <Text color="fg.warning">Session full</Text>
                </Tag>
              )}
            </HStack>

            {/* Session title */}
            <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" lineClamp={2} color={isFull ? 'fg.muted' : undefined}>
              {session.title}
            </Text>

            {/* Session description */}
            {session.description && (
              <Text fontSize={{ base: "xs", md: "sm" }} color="fg.muted" lineHeight="1.6" lineClamp={2}>
                {session.description}
              </Text>
            )}

            {/* Tags */}
            {session.tags && session.tags.length > 0 && (
              <HStack gap={2} flexWrap="wrap">
                {session.tags.map((tag, idx) => (
                  <Badge key={idx} variant="subtle" colorPalette="blue" size="sm">
                    {tag}
                  </Badge>
                ))}
              </HStack>
            )}

            {/* Mentor Info */}
            <HStack justify="space-between" w="full" p={{ base: 2, md: 4 }} bg={avs} rounded="md">
              <HStack>
                <Avatar size="sm" src={mentorData?.avatar_url ?? "/fallback.jpg"} name={mentorData?.full_name} />
                <Box>
                  <Text fontSize="sm" fontWeight="semibold">{mentorData?.full_name}</Text>
                  <Text fontSize="xs" color="fg.muted">{mentorData?.profile?.title}</Text>
                </Box>
              </HStack>

              <Link to={`/profile/$uuid`} params={{ uuid: mentorData?.uuid || '' }}>
                <Button size="xs" rounded="md" variant="surface" _hover={{ border: "1px solid" }}>View Profile</Button>
              </Link>
            </HStack>
          </VStack>
        </Tabs.Content>

        {/* Members Tab */}
        <Tabs.Content value="members" flex="1" minH="0" overflowY="auto">
          <VStack align="stretch" gap={2}>
            {confirmedBookings.length > 0 ? (
              confirmedBookings.map((booking) => (
                <Flex
                  key={booking.id}
                  align="center"
                  p={{ base: 2, md: 3 }}
                  borderRadius="md"
                  _hover={{ bg: avs }}
                  borderBottom="1px solid"
                  borderColor="border.subtle"
                >
                  <Avatar size="sm" src={booking.mentee?.avatar_url ?? "/fallback.jpg"} name={booking.mentee?.full_name || `Participant ${booking.id}`} mr={3} />
                  <Box flex={1}>
                    <Text fontWeight="medium" fontSize="sm">{booking.mentee?.full_name || 'Anonymous'}</Text>
                    <Text fontSize="xs" color="fg.muted">{booking.mentee?.email}</Text>
                  </Box>
                  <Badge colorPalette="green" fontSize="xs">Confirmed</Badge>
                </Flex>
              ))
            ) : (
              <Flex flexDir="column" align="center" justify="center" py={6}>
                <Text color="fg.muted" fontSize="sm">No confirmed bookings yet</Text>
                <Text color="fg.subtle" fontSize="xs" mt={2}>Be the first to book this session</Text>
              </Flex>
            )}
          </VStack>
        </Tabs.Content>

        {/* Preparation Tab */}
        {session.preparation_materials && session.preparation_materials.length > 0 && (
          <Tabs.Content value="prep" flex="1" maxH={{ base: "auto", md: "18em" }} overflowY="auto">
            <PreparationTab materials={session.preparation_materials} isFromHeroCard={true} />
          </Tabs.Content>
        )}
      </Tabs.Root>
    </Box>
  );
};

export const DrawerContainer = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>((props, ref) => {
  return (
    <Box pos="relative" overflow="hidden" ref={ref} w="full" h="full" {...props} />
  );
});
DrawerContainer.displayName = 'DrawerContainer';

export default InfoPanelContent;
