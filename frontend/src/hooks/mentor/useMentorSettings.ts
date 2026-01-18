import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useToaster from '../public/useToaster';
import {
  MentorsService,
  type MentorProfilePublic,
  type MentorSettingsPublic,
  type MentorSettingsUpdate
} from '@/client';
import { toNativePromise } from '@/utils/toNativePromisse';
import { getApiErrorMessage } from '@/utils/errorUtils';

/**
 * Hook for managing mentor settings
 */
export const useMentorSettings = ({ enabled = true } = {}) => {
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
    queryFn: () => toNativePromise(
      MentorsService.getMySettingsApiV1MentorsSettingsGet()
    ),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled,
    refetchOnMount: false,
  });

  // Update settings
  const updateSettings = useMutation<
    MentorSettingsPublic, // response
    Error,                // error
    MentorSettingsUpdate  // payload
  >({
    mutationFn: (data) =>
      toNativePromise(
        MentorsService.updateMySettingsApiV1MentorsSettingsPatch({
          requestBody: data
        })
      ),
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
  // Note: This uses the toggle endpoint from MentorsService, which updates the profile's is_available field
  const toggleAvailability = useMutation<MentorProfilePublic, Error>({
    mutationFn: () =>
      toNativePromise(
        MentorsService.toggleAvailabilityApiV1MentorsToggleAvailabilityPost()
      ),
    onSuccess: (data) => {
      const isAvailable = data?.settings?.currently_open_to_mentees ?? false;
      toast({
        id: 'toggle-availability-success',
        title: isAvailable
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