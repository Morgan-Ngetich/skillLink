'use client';

import { VStack, Box, Flex } from '@chakra-ui/react';
import { StyledInput } from '@/components/ui';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import UserProfileCard from '@/components/common/UserProfileCard';

export default function Step1BasicInfo() {
  const { register } = useFormContext();


  return (
    <VStack gap={8} align="stretch" mx="auto" w="full" maxW="6xl" px={4} mt={8}>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        gap={8}
        w="full"
      >
        {/* Profile Card */}
        <UserProfileCard />

        {/* Editable Info */}
        <Box w="full">
          <VStack gap={5} align="stretch">
            <FormControl>
              <FormLabel htmlFor="location">Location</FormLabel>
              <StyledInput
                id="location"
                type="text"
                {...register('location')}
                placeholder="e.g. San Francisco, CA"
              />
              {/* <Text fontSize="sm" color="gray.500" mt={2}>
                You are located in: <strong>{location || '—'}</strong>
              </Text> */}
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="bio">Bio</FormLabel>
              <StyledInput
                id="bio"
                type="text"
                {...register('bio')}
                placeholder="Tell us about yourself..."
              />
              {/* <Text fontSize="sm" color="gray.500" mt={2}>
                Bio preview: <strong>{bio || '—'}</strong>
              </Text> */}
            </FormControl>
          </VStack>
        </Box>
      </Flex>
    </VStack>
  );
}
