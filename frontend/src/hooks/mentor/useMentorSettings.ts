import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useToaster from '../../hooks/useToaster';
import {
  MentorSettingsService,
  type MentorSettingsBase,
  type MentorSettingsUpdate,
} from '@/client';
import { toNativePromise } from '@/utils/toNativePromisse';
import { getApiErrorMessage } from '@/utils/errorUtils';

export const useMentorSettings = () => {
  const toast = useToaster();
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<MentorSettingsBase, Error>({
    queryKey: ['mentorSettings'],
    queryFn: () => toNativePromise(MentorSettingsService.getMySettings()),
    staleTime: 1000 * 60 * 5,
  });

  const updateSettings = useMutation<MentorSettingsBase, Error, MentorSettingsUpdate>({
    mutationFn: (data) => toNativePromise(MentorSettingsService.updateSettings(data)),
    onSuccess: () => {
      toast({
        id: 'update-settings-success',
        title: 'Settings updated',
        status: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['mentorSettings'] });
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

  const toggleAvailability = useMutation<MentorSettingsBase, Error>({
    mutationFn: () => toNativePromise(MentorSettingsService.toggleAvailability()),
    onSuccess: (data) => {
      const status = data.currently_open_to_mentees ? 'available' : 'unavailable';
      toast({
        id: 'toggle-availability-success',
        title: `You are now ${status}`,
        status: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['mentorSettings'] });
    },
    onError: (error) => {
      toast({
        id: 'toggle-availability-error',
        title: 'Failed to toggle availability',
        description: getApiErrorMessage(error),
        status: 'error',
      });
    },
  });

  return {
    settings,
    isLoading,
    isError,
    error,
    refetch,
    updateSettings: updateSettings.mutate,
    toggleAvailability: toggleAvailability.mutate,
    isUpdating: updateSettings.isPending,
    isToggling: toggleAvailability.isPending,
  };
};
