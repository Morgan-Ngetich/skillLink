import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import useToaster from './useToaster';
import {
  ProfileService,
  type UserProfilePublic,
  type UserProfileCreate,
  type UserProfileUpdate,
  type ProfileCompletionStatus,
  type UserPublic,
  UserService,
  // type UserPublic,
} from '@/client';
import { toNativePromise } from '@/utils/toNativePromisse';
import { getApiErrorMessage } from '@/utils/errorUtils'; // your utility to extract error message

export const useProfile = () => {
  const toast = useToaster();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch current user profile
  const {
    data: profile,
    error,
    isLoading,
    isError,
    refetch,
  } = useQuery<UserProfilePublic, Error>({
    queryKey: ['profile', 'me'],
    queryFn: () => toNativePromise(ProfileService.getMyProfile()),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  const {
    data: profileCompletionStatus,
    isLoading: isProfileCompletionStatusLoading,
    refetch: refetchProfileCompletionStatus,
  } = useQuery<ProfileCompletionStatus, Error>({
    queryKey: ['mentorStats', 'me'],
    queryFn: () => toNativePromise(ProfileService.getProfileCompletionStatus()),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: !!profile, // Only fetch if mentor profile exists
  });

  // Create user profile mutation
  const createUserProfile = useMutation<UserProfilePublic, Error, UserProfileCreate>({
    mutationFn: (profile) => toNativePromise(ProfileService.createProfile(profile)),
    onSuccess: () => {
      toast({
        id: 'create-profile-success',
        title: 'Profile created',
        status: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
    onError: (error: unknown) => {
      toast({
        id: 'create-profile-error',
        title: 'Failed to create profile',
        description: getApiErrorMessage(error),
        status: 'error',
      });
    },
  });

  // Update user profile mutation
  const updateUserProfile = useMutation<UserProfilePublic, Error, UserProfileUpdate>({
    mutationFn: (data) => toNativePromise(ProfileService.updateProfile(data)),
    onSuccess: () => {
      toast({
        id: 'update-profile-success',
        title: 'Profile updated',
        status: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
    onError: (error: unknown) => {
      toast({
        id: 'update-profile-error',
        title: 'Failed to update profile',
        description: getApiErrorMessage(error),
        status: 'error',
      });
    },
  });


  // Create or update user profile based on existence
  const updateProfileAll = async (
    data: Partial<UserProfileCreate | UserProfileUpdate>,
    callbacks?: {
      onSettled?: () => void;
      onSuccess?: () => void;
      onError?: (error: unknown) => void;
    }
  ) => {
    setIsSubmitting(true);
    try {
      if (profile) {
        await updateUserProfile.mutateAsync(data as UserProfileUpdate);
      } else {
        await createUserProfile.mutateAsync(data as UserProfileCreate);
      }
      callbacks?.onSuccess?.();
    } catch (error) {
      callbacks?.onError?.(error);
    } finally {
      setIsSubmitting(false);
      callbacks?.onSettled?.();
      refetch();
    }
  };

  return {
    // Basic user
    // user,
    // userError,
    // isUserLoading,
    // isUserError,
    // refetchUser,

    // User profile
    profile,
    error,
    isLoading,
    isError,
    refetch,
    isSubmitting,
    setIsSubmitting,

    // Mutations
    createUserProfile: createUserProfile.mutate,
    updateUserProfile: updateUserProfile.mutate,


    // Profile status
    profileCompletionStatus,
    isProfileCompletionStatusLoading,
    refetchProfileCompletionStatus,


    // Smart update
    updateProfileAll,
  };
};


// export const useUserById = (userId: number | undefined) => {
//   return useQuery<UserPublic, Error>({
//     queryKey: ["user", userId],
//     queryFn: () => toNativePromise(UserService.getUserById(userId!)),
//     enabled: !!userId, // Only fetch if ID is provided
//     retry: 1,
//     staleTime: 1000 * 60 * 5, // Cache for 5 minutes
//   });
// };

/**
 * Hook to fetch user by ID or UUID
 * 
 * Returns complete user with nested mentor profile
 */
export const useUserById = (identifier: string | number, enabled: boolean = true) => {
  return useQuery<UserPublic, Error>({
    queryKey: ['user', identifier],
    queryFn: () => UserService.getUserByIdentifier(identifier),
    enabled: enabled && !!identifier,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch user by UUID (alias)
 */
export const useUserByUuid = (uuid: string, enabled: boolean = true) => {
  return useUserById(uuid, enabled);
};


