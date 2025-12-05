import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useToaster from '../public/useToaster';
import { MentorSettingsService, type MentorSettingsPublic, type MentorSettingsUpdate } from '@/client';
import { toNativePromise } from '@/utils/toNativePromisse';
import { getApiErrorMessage } from '@/utils/errorUtils';

/**
 * Hook for managing mentor settings
 */
export const useMentorSettings = () => {
  const toast = useToaster();
  const queryClient = useQueryClient();

  // Fetch current user's mentor settings
  const {
    data: settings,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<MentorSettingsPublic, Error>({
    queryKey: ['mentorSettings'],
    queryFn: () => toNativePromise(MentorSettingsService.getMyMentorSettings()),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // Update settings
  const updateSettings = useMutation<
    MentorSettingsPublic, // response
    Error,                // error
    MentorSettingsUpdate  // payload
  >({
    mutationFn: (data) =>
      toNativePromise(MentorSettingsService.updateMyMentorSettings(data)),
    onSuccess: () => {
      toast({
        id: 'update-settings-success',
        title: 'Settings updated',
        status: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['mentorSettings'] });
      queryClient.invalidateQueries({ queryKey: ['mentorProfile'] });
    },
    onError: (error) => {
      toast({
        id: 'update-settings-error',
        title: 'Failed to update settings',
        description: getApiErrorMessage(error),
        status: 'error',
      });
    },
  });

  // Toggle availability (quick action)
  // Points to => `currently_open_to_mentees` on the backend
  const toggleAvailability = useMutation<MentorSettingsPublic, Error>({
    mutationFn: () =>
      toNativePromise(MentorSettingsService.toggleMentorAvailability()),
    onSuccess: (data) => {
      toast({
        id: 'toggle-availability-success',
        title: data.currently_open_to_mentees
          ? 'Now accepting mentees'
          : 'No longer accepting mentees',
        status: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['mentorSettings'] });
      queryClient.invalidateQueries({ queryKey: ['mentorProfile'] });
    },
    onError: (error) => {
      toast({
        id: 'toggle-availability-error',
        title: 'Failed to update availability',
        description: getApiErrorMessage(error),
        status: 'error',
      });
    },
  });

  return {
    // Data
    settings,
    isLoading,
    isError,
    error,

    // Actions
    refetch,
    updateSettings: updateSettings.mutate,
    updateSettingsAsync: updateSettings.mutateAsync,
    toggleAvailability: toggleAvailability.mutate,
    toggleAvailabilityAsync: toggleAvailability.mutateAsync,

    // Loading states
    isUpdating: updateSettings.isPending,
    isToggling: toggleAvailability.isPending,
  };
};