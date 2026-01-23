import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import useToaster from './useToaster';
import {
  ProfilesService,
  UsersService,
  type UserProfilePublic,
  type UserProfileCreate,
  type UserProfileUpdate,
  type UserPublic,
} from '@/client';
import { toNativePromise } from '@/utils/toNativePromisse';
import { getApiErrorMessage } from '@/utils/errorUtils';

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
    queryFn: () => toNativePromise(
      ProfilesService.getMyProfileApiV1ProfilesMeGet()
    ),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  // Fetch profile completion status
  const {
    data: profileCompletionStatus,
    isLoading: isProfileCompletionStatusLoading,
    refetch: refetchProfileCompletionStatus,
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useQuery<Record<string, any>, Error>({
    queryKey: ['profileCompletionStatus', 'me'],
    queryFn: () => toNativePromise(
      ProfilesService.getCompletionStatusApiV1ProfilesCompletionStatusGet()
    ),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: !!profile, // Only fetch if profile exists
  });

  // Create user profile mutation
  const createUserProfile = useMutation<UserProfilePublic, Error, UserProfileCreate>({
    mutationFn: (profile) => toNativePromise(
      ProfilesService.createProfileApiV1ProfilesPost({ 
        requestBody: profile 
      })
    ),
    onSuccess: () => {
      toast({
        id: 'create-profile-success',
        title: 'Profile created',
        status: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['profileCompletionStatus', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
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
    mutationFn: (data) => toNativePromise(
      ProfilesService.updateMyProfileApiV1ProfilesPatch({ 
        requestBody: data 
      })
    ),
    onSuccess: () => {
      toast({
        id: 'update-profile-success',
        title: 'Profile updated',
        status: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['profileCompletionStatus', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
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
    createUserProfileAsync: createUserProfile.mutateAsync,
    updateUserProfile: updateUserProfile.mutate,
    updateUserProfileAsync: updateUserProfile.mutateAsync,

    // Profile completion status
    profileCompletionStatus,
    isProfileCompletionStatusLoading,
    refetchProfileCompletionStatus,

    // Smart update
    updateProfileAll,

    // Loading states
    isCreating: createUserProfile.isPending,
    isUpdating: updateUserProfile.isPending,
  };
};

/**
 * Hook to fetch user profile by user ID (public)
 * 
 * @param userId - Numeric ID of the user
 * @param enabled - Whether to fetch (default: true)
 */
export const useUserProfileById = (
  userId: number,
  enabled: boolean = true
) => {
  return useQuery<UserProfilePublic, Error>({
    queryKey: ['userProfile', userId],
    queryFn: () => toNativePromise(
      ProfilesService.getUserProfileApiV1ProfilesUserIdGet({ userId })
    ),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook to fetch user by ID or UUID
 * 
 * Returns complete user with nested mentor profile
 * 
 * @param identifier - User ID (number) or UUID (string)
 * @param enabled - Whether to fetch (default: true)
 */
export const useUserById = (
  identifier: string | number, 
  enabled: boolean = true
) => {
  return useQuery<UserPublic, Error>({
    queryKey: ['user', identifier],
    queryFn: () => toNativePromise(
      UsersService.getUserApiV1UsersIdentifierGet({ 
        identifier: String(identifier) 
      })
    ),
    enabled: enabled && !!identifier,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook to fetch user by UUID (alias for useUserById)
 * 
 * @param uuid - User UUID string
 * @param enabled - Whether to fetch (default: true)
 */
export const useUserByUuid = (
  uuid: string | undefined, 
  options?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialData?: any;
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: ['public-user', uuid],
    queryFn: () => toNativePromise(
      UsersService.getUserApiV1UsersIdentifierGet({ 
        identifier: String(uuid) 
      })
    ),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // Use initial data from route loader
    initialData: options?.initialData,
    // Only fetch if enabled (true by default)
    enabled: (options?.enabled ?? true) && !!uuid,
  });
};

