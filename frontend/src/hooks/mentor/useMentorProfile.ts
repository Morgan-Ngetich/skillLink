import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import useToaster from '../public/useToaster';
import {
  ProfileService,
  type MentorProfilePublic,
  type MentorProfileCreate,
  type MentorProfileUpdate,
  type MentorStats,
} from '@/client';
import { toNativePromise } from '@/utils/toNativePromisse';
import { getApiErrorMessage } from '@/utils/errorUtils';

export const useMentorProfile = () => {
  const toast = useToaster();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch current mentor profile
  const {
    data: mentorProfile,
    error: mentorError,
    isLoading: isMentorLoading,
    isError: isMentorError,
    refetch: refetchMentorProfile,
  } = useQuery<MentorProfilePublic, Error>({
    queryKey: ['mentorProfile', 'me'],
    queryFn: () => toNativePromise(ProfileService.getMyMentorProfile()),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  // Fetch mentor stats
  const {
    data: mentorStats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useQuery<MentorStats, Error>({
    queryKey: ['mentorStats', 'me'],
    queryFn: () => toNativePromise(ProfileService.getMentorStats()),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: !!mentorProfile, // Only fetch if mentor profile exists
  });

  // Create mentor profile mutation
  const createMentorProfile = useMutation<
    MentorProfilePublic,
    Error,
    MentorProfileCreate
  >({
    mutationFn: (profile) =>
      toNativePromise(ProfileService.createMentorProfile(profile)),
    onSuccess: () => {
      toast({
        id: 'create-mentor-profile-success',
        title: 'Mentor profile created',
        description: 'Welcome to the mentor community!',
        status: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] }); // Update user roles
      queryClient.invalidateQueries({ queryKey: ['mentorProfile', 'me'] });
    },
    onError: (error: unknown) => {
      toast({
        id: 'create-mentor-profile-error',
        title: 'Failed to create mentor profile',
        description: getApiErrorMessage(error),
        status: 'error',
      });
    },
  });

  // Update mentor profile mutation
  const updateMentorProfile = useMutation<
    MentorProfilePublic,
    Error,
    MentorProfileUpdate
  >({
    mutationFn: (data) =>
      toNativePromise(ProfileService.updateMentorProfile(data)),
    onSuccess: () => {
      toast({
        id: 'update-mentor-profile-success',
        title: 'Mentor profile updated',
        status: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['mentorProfile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['mentorStats', 'me'] });
    },
    onError: (error: unknown) => {
      toast({
        id: 'update-mentor-profile-error',
        title: 'Failed to update mentor profile',
        description: getApiErrorMessage(error),
        status: 'error',
      });
    },
  });

  // Smart update: create or update based on existence
  const updateMentorProfileAll = async (
    data: Partial<MentorProfileCreate | MentorProfileUpdate>,
    callbacks?: {
      onSettled?: () => void;
      onSuccess?: () => void;
      onError?: (error: unknown) => void;
    }
  ) => {
    setIsSubmitting(true);
    try {
      if (mentorProfile) {
        await updateMentorProfile.mutateAsync(data as MentorProfileUpdate);
      } else {
        await createMentorProfile.mutateAsync(data as MentorProfileCreate);
      }
      callbacks?.onSuccess?.();
    } catch (error) {
      callbacks?.onError?.(error);
    } finally {
      setIsSubmitting(false);
      callbacks?.onSettled?.();
    }
  };

  return {
    // Mentor profile
    mentorProfile,
    mentorError,
    isMentorLoading,
    isMentorError,
    refetchMentorProfile,
    isSubmitting,
    setIsSubmitting,

    // Stats
    mentorStats,
    isStatsLoading,
    refetchStats,

    // Mutations
    createMentorProfile: createMentorProfile.mutate,
    updateMentorProfile: updateMentorProfile.mutate,

    // Smart update
    updateMentorProfileAll,

    // Loading states
    isCreating: createMentorProfile.isPending,
    isUpdating: updateMentorProfile.isPending,
  };
};