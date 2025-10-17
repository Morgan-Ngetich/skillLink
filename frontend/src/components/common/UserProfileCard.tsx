'use client';

import { Box, VStack, Text, Image, Skeleton } from '@chakra-ui/react';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/auth/useAuth';

const UserProfileCard = () => {
  const { user, isLoading } = useAuth(); // Assuming your hook supports a `loading` state

  if (isLoading || !user) {
    return (
      <Box
        w="full"
        maxW="sm"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
        border="1px solid"
      >
        {/* Banner Skeleton */}
        <Box position="relative" h="100px">
          <Skeleton w="full" h="100%" />
          <Box
            position="absolute"
            bottom="-30px"
            left="20px"
            border="2px solid"
            borderRadius="full"
            bg="gray.300"
          >
            <Skeleton boxSize="65px" borderRadius="full" />
          </Box>
        </Box>

        {/* User Info Skeleton */}
        <VStack align="start" gap={2} pt={10} pb={4} px={4}>
          <Skeleton height="16px" width="70%" />
          <Skeleton height="14px" width="50%" />
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      w="full"
      maxW="sm"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      border="1px solid"
    >
      {/* Banner */}
      <Box position="relative" h="100px">
        <Image
          src={user.avatar_url}
          alt="Banner"
          objectFit="cover"
          w="full"
          h="100%"
        />
        <Avatar
          size="2xl"
          src={user.avatar_url || ''}
          name={user.full_name || ''}
          position="absolute"
          bottom="-30px"
          left="20px"
          border="2px solid white"
        />
      </Box>

      {/* User Info */}
      <VStack align="start" gap={1} pt={10} pb={4} px={4}>
        <Text fontWeight="bold" fontSize="lg">
          {user.full_name}
        </Text>
        <Text fontSize="sm">
          {user.email}
        </Text>
      </VStack>
    </Box>
  );
};

export default UserProfileCard;
