'use client';

import {
  Box,
  Flex,
  IconButton,
  HStack,
  Image,
  Separator,
} from '@chakra-ui/react';
import { FiEdit } from 'react-icons/fi';
import { Avatar, Tag, useColorModeValue } from '@/components/ui';

import GoalAndInterestSection from './GoalAndInterestSection';
import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';
import SkillsSection from './SkillsSection';
import MenteeProfileSection from './MenteeProfileSection';

const user = {
  full_name: 'Aisha Kamau',
  role: 'Mentee - Aspiring Product Designer',
  location: 'Nairobi, Kenya',
  avatar_url: 'https://randomuser.me/api/portraits/women/44.jpg',
  education: 'BSc in Information Technology, JKUAT (2020 - 2024)',
  background:
    'Self-taught designer with 1 year of freelance experience in branding and basic web design.',
  interests: ['UX Research', 'Inclusive Design', 'Mobile App Design'],
  preferred_communication: 'Weekly calls, async text updates',
  goals: {
    title: 'Become a UX/UI Designer in 3 months',
    progress: 35,
    summary:
      'Build a portfolio of 3 case studies, apply to 10 job openings, and land a junior role or internship.',
  },
  skills: ['Figma', 'UI Design', 'Wireframing', 'Prototyping', 'HTML', 'Canva'],
  area_of_focus: ['Tech', 'Business', 'Engineering'],
  education_logo:
    'https://upload.wikimedia.org/wikipedia/commons/4/44/Moringa_School_logo.png',
  work_logo: 'https://cdn-icons-png.flaticon.com/512/25/25284.png',
  twitter: 'https://twitter.com/fakeprofile',
  linkedin: 'https://linkedin.com/in/fakeprofile',
  github: 'https://github.com/fakeprofile',
};

export default function MenteeProfileCard() {
  const border = useColorModeValue("1px solid", "")

  const renderTags = () =>
    user.area_of_focus?.map((focus) => (
      <Tag
        key={focus}
        size="md"
        bg={'white'}
        color={'black'}
        border={border}
        borderColor={'black'}
        borderRadius="sm"
      >
        {focus}
      </Tag>
    ));

  const renderSeparatorSection = (Component: React.ElementType, props = {}) => (
    <>
      <Component {...props} />
      <Separator mt={4} />
    </>
  );

  return (
    <Box borderRadius="lg" overflow="hidden" boxShadow="lg" maxW="3xl" border="1px solid">
      <Box position="relative">
        {/* Banner */}
        <Box h="150px" position="relative">
          <Image
            src={user.avatar_url || '/fallback-banner.jpg'}
            alt="Banner"
            objectFit="cover"
            w="full"
            h="100%"
          />
          <IconButton
            aria-label="Edit"
            size="sm"
            position="absolute"
            top="10px"
            right="10px"
            borderRadius="full"
            boxShadow="md"
            _hover={{ bg: 'gray.100' }}
          >
            <FiEdit />
          </IconButton>
          <HStack
            position="absolute"
            bottom="3px"
            right="10px"
            gap={2}
            flexWrap="wrap"
            justify="flex-end"
          >
            {renderTags()}
          </HStack>
        </Box>

        {/* Avatar */}
        <Avatar
          boxSize="100px"
          src={user.avatar_url}
          name={user.full_name}
          position="absolute"
          bottom="-40px"
          left="20px"
          border="2px solid"
          boxShadow="md"
        />
      </Box>

      <Box px={6} pt={12} pb={6}>
        <Flex direction="column" gap={4}>
          {renderSeparatorSection(MenteeProfileSection)}
          {renderSeparatorSection(SkillsSection, { skills: user.skills })}
          {renderSeparatorSection(GoalAndInterestSection)}
          {renderSeparatorSection(ExperienceSection)}
          {renderSeparatorSection(EducationSection)}
        </Flex>
      </Box>
    </Box>
  );
}
