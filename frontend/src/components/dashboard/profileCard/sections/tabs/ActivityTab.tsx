import GrowthStats from '@/components/homepage/GrowthStats';
import { Box, Text } from '@chakra-ui/react';
import type React from 'react';

interface ActivityTabProps {
  isMentor?: boolean;
}

const ActivityTab: React.FC<ActivityTabProps> = () => {
  return (
    <Box>
      <Text fontWeight="bold" fontSize="lg" mb={4}>Recent Activity</Text>
      <GrowthStats />
    </Box>
  );
};

export default ActivityTab;