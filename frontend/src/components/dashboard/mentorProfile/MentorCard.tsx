// MentorCard.jsx
import {
  Box,
  Text,
  Stack,
  Badge,
  HStack,
  VStack,
  Button,
  Icon,
  Image,
  Center,
  Flex,
} from '@chakra-ui/react';
import { useColorModeValue, Avatar } from '@/components/ui';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';

export const MentorCard = ({ mentor }) => {
  return (
    <Box
      borderRadius="xl"
      boxShadow="xl"
      bg={"cardbg"}
      borderWidth="2px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      {/* Cover Image and Avatar */}
      <Box position="relative" borderRadius="xl">
        {/* Banner Image */}
        <Box borderTopRadius="xl" overflow="hidden">
          <Box aspectRatio={4 / 1} position="relative">
            <Image
              src={mentor.coverImage || '/fallback-banner.jpg'}
              alt={`${mentor.name}'s cover`}
              objectFit="cover"
              w="100%"
              h="100%"
            />

            {/* Tags */}
            <HStack
              position="absolute"
              bottom="4px"
              right="10px"
              gap={2}
              flexWrap="wrap"
              justify="flex-end"
            >
              {mentor.tags?.map((tag) => (
                <Badge key={tag} colorScheme="purple" fontSize="xs">
                  {tag}
                </Badge>
              ))}
            </HStack>
          </Box>
        </Box>

        {/* Avatar */}
        <Avatar
          boxSize="60px"
          src={mentor.photo}
          name={mentor.name}
          position="absolute"
          bottom="-25px"
          left="20px"
          border="2px solid"
        />
      </Box>




      {/* Main Content */}
      <Box pt={3} pb={5} px={4} mt={4}>
        <VStack align="start" w="100%" gap={2}>
          <HStack w="100%" justify="space-between" align="start">
            <Text fontWeight="bold" fontSize="lg">
              {mentor.name}
            </Text>
            {mentor.available && (
              <Badge colorPalette={'green'} variant={'surface'}>
                {'Available'}
              </Badge>
            )}
          </HStack>

          <Text fontSize="sm" fontWeight={'medium'}>
            {mentor.title}
          </Text>
        </VStack>


        {/* Bio */}
        <Text mt={1} fontSize="sm" lineClamp={3} color="fg.muted">
          {mentor.bio}
        </Text>

        {/* Skills */}
        <HStack gap={2} mt={4} overflowX={'auto'} scrollbar={'hidden'}>
          {mentor.skills.map((skill) => (
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
            <Text color={'fg.muted'}>
              {mentor.rating} ({mentor.reviews})
            </Text>
          </HStack>
          <HStack>
            <Icon as={FaMapMarkerAlt} />
            <Text color='fg.muted'>{mentor.location}</Text>
          </HStack>
        </HStack>

        {/* CTA */}
        <Button mt={5} width="100%">
          View Profile
        </Button>
      </Box>
    </Box>
  );
};
