import { Box, HStack, Text, VStack, Icon } from '@chakra-ui/react';
import {
  FiHome,
  // FiSettings,
  FiUser,
  FiCompass,
} from 'react-icons/fi';

interface SidebarSkeletonProps {
  isMobile?: boolean;
}

export const SidebarSkeleton = ({ isMobile }: SidebarSkeletonProps) => {
  if (isMobile) {
    return (
      <Box
        position="fixed"
        bottom="0"
        left="0"
        right="0"
        zIndex="sticky"
        px={2}
        pt={2}
        bg="bg"
      >
        <HStack justify="space-around" align="center" gap={1}>
          <VStack>
            <Icon as={FiHome} boxSize={6} />
            <Text fontSize="2xs">
              Home
            </Text>
          </VStack>
          <VStack>
            <Icon as={FiCompass} boxSize={6} />
            <Text fontSize="2xs">
              Explore
            </Text>
          </VStack>
          <VStack>
            <Icon as={FiUser} boxSize={6} />
            <Text fontSize="2xs">
              Profile
            </Text>
          </VStack>
        </HStack>
      </Box>
    );
  }

  return (
    <Box
      position="relative"
      h="100vh"
      w="72px"
      borderRight="1px solid"
      borderColor="border.emphasized"
    >
      <VStack gap={7} align="stretch" pt={16} px={6} pb={6}>
        <Icon as={FiHome} boxSize={6} />
        <Icon as={FiCompass} boxSize={6} />
        <Icon as={FiUser} boxSize={6} />
      </VStack>
    </Box>
  );
};