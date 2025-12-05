import type { Mentor } from '@/client/services/ment';
import { Avatar } from '@/components/ui';
import { Box, Text, Flex } from '@chakra-ui/react';

interface MentorCompactCardProps {
  mentor: Mentor
}


const MentorCompactCard: React.FC<MentorCompactCardProps> = ({ mentor }) => {
  return (
    <Flex direction="column" align="center" w="70px" mx="1">
      {/* Gradient border wrapper */}

      {/* White background for inner circle (like a stroke) */}
      <Box
        borderRadius="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Avatar
          border="2px solid"
          src={mentor.photo}
          name={mentor.name}
          boxSize="70px"
        />
      </Box>


      {/* Name */}
      <Text fontSize="sm"  mt={1} truncate maxW="60px" textAlign="center">
        {mentor.name}
      </Text>
    </Flex>
  );
};

export default MentorCompactCard;
