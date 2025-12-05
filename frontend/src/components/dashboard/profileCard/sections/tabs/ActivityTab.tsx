import BecomeMentorButton from '@/components/dashboard/mentor/mentorProfileSetup/BecomeMentorButton';
import { Box, Text } from '@chakra-ui/react';

interface ActivityTabProps {
  isMentor?: boolean;
}

const ActivityTab = ({ isMentor }: ActivityTabProps) => {
  return (
    <Box>
      <Text fontWeight="bold" fontSize="lg" mb={4}>Recent Activity</Text>
      {!isMentor && <BecomeMentorButton />}
    </Box>
  );
};

export default ActivityTab;