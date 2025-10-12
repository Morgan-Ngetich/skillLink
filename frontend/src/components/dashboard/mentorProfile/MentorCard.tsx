// MentorCard.jsx
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
import type { Mentor } from '@/client/services/ment';
import { Link, useNavigate } from '@tanstack/react-router';


interface MentorCardProps {
  mentor: Mentor;
  onCollapse?: () => void;
  maxW?: string;
}

export const MentorCard: React.FC<MentorCardProps> = ({ mentor, maxW="full" }) => {
  const badgeBg = { base: 'gray.50', _dark: 'gray.100' }

  const navigate = useNavigate()
  const isMobile = useBreakpointValue({ base: true, md: false })
  // const cardWidth = useBreakpointValue({
  //   base: '320px',
  //   sm: '320px',
  //   md: '100%'
  // })

  return (

    <Box
      // TODO Create a variant in the theme file, add this as the default styles for card.
      borderRadius="xl"
      boxShadow="xl"
      bg={"cardbg"}
      borderWidth="2px"
      borderColor={{ base: 'gray.200', _dark: 'gray.700' }}

      w={maxW}
      // minW={isMobile ? '260px' : 'auto'}
      onClick={isMobile ? () => navigate({ to: '/mentor' }) : undefined}

    >
      {/* Cover Image and Avatar */}
      <Box position="relative" borderRadius="xl">
        {/* Banner Image */}
        <Box>
          <Box position="relative">
            <Box overflow={'hidden'} aspectRatio={4 / 1} borderTopRadius="xl" >
              <Image
                src={mentor.coverImage || '/fallback-banner.jpg'}
                alt={`${mentor.name}'s cover`}
                objectFit="cover"
                w="100%"
                h="100%"
              />

              <Box
                position="absolute"
                bottom="0"
                left="0"
                right="0"
                height="50%"
                bgGradient="linear(to-t, blackAlpha.600, transparent)"
              />
            </Box>

            {/* Tags */}
            <HStack
              position="absolute"
              bottom="4px"
              right="10px"
              left="34%"
              gap={2}
              // maxW={''}
              overflowX="auto"
              whiteSpace="nowrap"
              alignItems="flex-end"
              scrollbar="hidden"
            >
              {mentor.badges?.map((badge: string) => (
                <Badge
                  key={badge}
                  bg="blackAlpha.600"
                  backdropFilter="blur(10px)"
                  color="white"
                  fontSize="xs"
                  px={2}
                  py={1}
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
            <Box position="absolute" bottom="-25px" left="20px">
              <Avatar
                boxSize="60px"
                src={mentor.photo}
                name={mentor.name}
                border="2px solid white"
              />

              {mentor.available && (
                <Box
                  position="absolute"
                  bottom="2px"
                  right="2px"
                  boxSize="14px"
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
      <Box pt={3} pb={5} px={4} mt={4}>
        <VStack align="start" w="100%" gap={2}>
          <HStack w="100%" justify="space-between" align="start">
            <Text fontWeight="bold" fontSize="lg">
              {mentor.name}
            </Text>
            <Text>
              {mentor.rate}
            </Text>
          </HStack>

          <Text fontSize="sm" fontWeight={'medium'} lineClamp={1}>
            {mentor.title}
          </Text>
        </VStack>


        {/* Bio */}
        <Tooltip content={mentor.bio} showArrow portalled={false} disabled={!mentor.bio}>

          <Text mt={1} fontSize="sm" lineClamp={2} color="fg.muted" >
            {mentor.bio}
          </Text>
        </Tooltip>

        {/* Skills */}
        <HStack gap={2} mt={4} overflowX={'auto'} scrollbar={'hidden'}>
          {mentor.skills.map((skill: string) => (
            <Badge
              key={skill}
              variant="surface"
              colorPalette="purple"
              fontSize="xs"
              px={2}
              py={1}
              borderRadius="lg"
            >
              {skill}
            </Badge>
          ))}
        </HStack>

        {/* Stats & Location */}
        <HStack mt={4} justify="space-between" fontSize="sm">
          <HStack>
            <Icon as={FaStar} color="yellow.400" />
            <Text color={'fg.muted'} lineClamp={1}>
              {mentor.rating} ({mentor.reviews})
            </Text>
          </HStack>
          <HStack>
            <Icon as={FaMapMarkerAlt} />
            <Text color='fg.muted' lineClamp={1}>{mentor.location}</Text>
          </HStack>
        </HStack>

        {/* CTA */}
        {!isMobile && (
          <Link to={"/mentor"}>
            <Button mt={5} width="100%">
              View Profile
            </Button>
          </Link>
        )}
      </Box>
    </Box>

  );
};
