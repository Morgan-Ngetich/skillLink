import {
  Box,
  Text,
  Badge,
  HStack,
  VStack,
  Button,
  Icon,
  Image,
  useBreakpointValue,
} from '@chakra-ui/react';
import { Avatar, Tooltip } from '@/components/ui';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { Link, useNavigate } from '@tanstack/react-router';
import type { MentorExplorePublic } from '@/client';

interface MentorCardProps {
  mentor: MentorExplorePublic;
  onCollapse?: () => void;
  maxW?: string;
}

export const MentorCard: React.FC<MentorCardProps> = ({ mentor, maxW = "full" }) => {
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box
      borderRadius="xl"
      boxShadow="xl"
      bg="cardbg"
      borderWidth="2px"
      borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
      minW={"250px"}
      maxW={maxW}
      h="full"
      display="flex"
      flexDirection="column"
      onClick={isMobile ? () => navigate({
        to: "/profile/$uuid",
        params: { uuid: mentor.uuid },
        search: {
          pt: "about",
          st: "sessions",
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
        }
      }) : undefined}
    >
      {/* Cover Image and Avatar */}
      <Box position="relative" borderRadius="xl">
        {/* Banner Image */}
        <Box>
          <Box position="relative">
            <Box overflow="hidden" aspectRatio={4 / 1} borderTopRadius="xl">
              <Image
                src={mentor?.cover_image || '/fallback.jpg'}
                alt={`${mentor.full_name}'s cover`}
                objectFit="cover"
                w="100%"
                h="100%"
              />

              <Box
                position="absolute"
                bottom="0"
                left="0"
                right="0"
                height="100%"
              />
            </Box>

            {/* Tags */}
            <HStack
              position="absolute"
              bottom="1"
              right="2.5"
              left="34%"
              gap={2}
              overflowX="auto"
              whiteSpace="nowrap"
              alignItems="flex-end"
              scrollbar="hidden"
            >
              {mentor?.area_of_focus?.map((badge: string) => (
                <Badge
                  key={badge}
                  bg="blackAlpha.600"
                  backdropFilter="blur(10px)"
                  color="white"
                  fontSize="xs"
                  px={2}
                  py={0}
                  borderRadius="md"
                  fontWeight="semibold"
                  border="1px solid"
                  borderColor="whiteAlpha.600"
                >
                  {badge}
                </Badge>
              ))}
            </HStack>

            {/* Avatar */}
            <Box position="absolute" bottom="-6" left="5">
              <Avatar
                boxSize={{ base: "12", md: "15" }}
                src={mentor?.avatar_url ?? undefined}
                name={mentor.full_name ?? undefined}
                border="2px solid white"
              />

              {mentor.total_sessions > 0 && (
                <Box
                  position="absolute"
                  bottom="0.5"
                  right="0.5"
                  boxSize={{ base: "3", md: "3.5" }}
                  bg="green.500"
                  borderWidth="2px"
                  borderColor="white"
                  borderRadius="full"
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box pt={3} pb={5} px={4} mt={4} flex="1" display="flex" flexDirection="column">
        <VStack align="start" w="100%" gap={2}>
          <HStack w="100%" justify="space-between" align="start">
            <Text fontWeight="bold" fontSize="lg" lineClamp={1}>
              {mentor.full_name}
            </Text>
            <Text flexShrink={0}>
              4.5
            </Text>
          </HStack>

          <Text fontSize="sm" fontWeight="medium" lineClamp={1}>
            {mentor?.title}
          </Text>
        </VStack>

        {/* Bio */}
        <Tooltip content={mentor?.about} showArrow portalled={false} disabled={!mentor?.about}>
          <Text mt={1} fontSize="sm" lineClamp={2} color="fg.muted" minH="40px">
            {mentor?.about}
          </Text>
        </Tooltip>

        {/* Skills */}
        {mentor?.skills && (
          <HStack gap={2} mt={4} overflowX="auto" scrollbar="hidden">
            {mentor?.skills.map((skill: string) => (
              <Badge
                key={skill}
                variant="surface"
                colorPalette="purple"
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="lg"
                flexShrink={0}
              >
                {skill}
              </Badge>
            ))}
          </HStack>
        )}

        {/* Stats & Location */}
        <HStack mt={4} justify="space-between" fontSize="sm" gap={2}>
          <HStack minW={0} flex={1} justify={"start"}>
            <Icon as={FaStar} color="yellow.400" flexShrink={0} />
            <Text color="fg.muted" lineClamp={1}>
              4.5 (5)
            </Text>
          </HStack>
          <HStack minW={0} flex={1} justify={"end"}>
            <Icon as={FaMapMarkerAlt} flexShrink={0} />
            <Text color="fg.muted" lineClamp={1}>{mentor?.location}</Text>
          </HStack>
        </HStack>

        {/* CTA */}
        {!isMobile && (
          <Link
            to="/profile/$uuid"
            params={{ uuid: mentor.uuid }}
            search={{
              pt: "about",
              st: "sessions",
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
            <Button mt={5} width="100%">
              View Profile
            </Button>
          </Link>
        )}
      </Box>
    </Box>
  );
};