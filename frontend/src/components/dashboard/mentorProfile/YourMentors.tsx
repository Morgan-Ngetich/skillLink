import { useState } from 'react';
import { Box, IconButton, HStack, Text } from '@chakra-ui/react';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { MentorCard } from './MentorCard';
import MentorCompactCard from './MentorCompactCard';
import { mentors } from '@/client/services/ment';



const YourMentors = () => {
  const [allExpanded, setAllExpanded] = useState(true);

  const toggleAll = () => {
    setAllExpanded(prev => !prev);
  };

  return (
    <Box border="1px solid" borderRadius="lg" pl={3} pt={2} position="relative">
      <HStack justify="space-between">
        <Text fontWeight="semibold">Your Mentors</Text>

        <IconButton
          size="sm"
          aria-label={allExpanded ? 'Collapse All' : 'Expand All'}
          onClick={toggleAll}
          variant="ghost"
        >
          {allExpanded ? <FiMinimize2 /> : <FiMaximize2 />}
        </IconButton>
      </HStack>

      <Box overflowX="auto" whiteSpace="nowrap" pt={2}>
        <HStack gap={3}>
          {mentors.map((mentor) => (
            <Box key={mentor.name} display="inline-block" minW={allExpanded ? '300px' : ''}>
              {allExpanded ? (
                <MentorCard mentor={mentor} />
              ) : (
                <MentorCompactCard mentor={mentor} />
              )}
            </Box>
          ))}
        </HStack>
      </Box>
    </Box>
  );
};

export default YourMentors;