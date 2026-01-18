import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import useToaster from '../public/useToaster';
import {
  MentorsService,
  type MentorServiceCreate,
  type MentorServiceUpdate,
  type MentorServicePublic,
} from '@/client';
import { toNativePromise } from '@/utils/toNativePromisse';
import { getApiErrorMessage } from '@/utils/errorUtils';

/**
 * Hook for managing mentor services (current user's services)
 */
export const useMentorServices = ({ enabled = true } = {}) => {
  const toast = useToaster();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch current user's services
  const {
    data: services,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<MentorServicePublic[], Error>({
    queryKey: ['mentorServices'],
    queryFn: () => toNativePromise(
      MentorsService.listMyServicesApiV1MentorsServicesGet()
    ),
    staleTime: 1000 * 60 * 5,
    enabled,
    refetchOnMount: false,
  });

  // Create service
  const createService = useMutation<MentorServicePublic, Error, MentorServiceCreate>({
    mutationFn: (data) => toNativePromise(
      MentorsService.createServiceApiV1MentorsServicesPost({
        requestBody: data
      })
    ),
    onSuccess: () => {
      toast({
        id: 'create-service-success',
        title: 'Service created',
        status: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['mentorServices'] });
    },
    onError: (error) => {
      toast({
        id: 'create-service-error',
        title: 'Failed to create service',
        description: getApiErrorMessage(error),
        status: 'error',
      });
    },
  });

  // Update service
  const updateService = useMutation<
    MentorServicePublic,
    Error,
    { id: number; data: MentorServiceUpdate }
  >({
    mutationFn: ({ id, data }) => toNativePromise(
      MentorsService.updateServiceApiV1MentorsServicesServiceIdPatch({
        serviceId: id,
        requestBody: data
      })
    ),
    onSuccess: () => {
      toast({
        id: 'update-service-success',
        title: 'Service updated',
        status: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['mentorServices'] });
    },
    onError: (error) => {
      toast({
        id: 'update-service-error',
        title: 'Failed to update service',
        description: getApiErrorMessage(error),
        status: 'error',
      });
    },
  });

  // Delete service
  const deleteService = useMutation<void, Error, number>({
    mutationFn: (id) => toNativePromise(
      MentorsService.deleteServiceApiV1MentorsServicesServiceIdDelete({
        serviceId: id
      })
    ),
    onSuccess: () => {
      toast({
        id: 'delete-service-success',
        title: 'Service deleted',
        status: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['mentorServices'] });
    },
    onError: (error) => {
      toast({
        id: 'delete-service-error',
        title: 'Failed to delete service',
        description: getApiErrorMessage(error),
        status: 'error',
      });
    },
  });

  // Smart create/update helper
  const saveService = async (
    data: Partial<MentorServiceCreate | MentorServiceUpdate> & { id?: number },
    callbacks?: {
      onSettled?: () => void;
      onSuccess?: () => void;
      onError?: (err: unknown) => void
    }
  ) => {
    setIsSubmitting(true);
    try {
      if (data.id) {
        console.log("Found the data.id", data.id);
        await updateService.mutateAsync({ id: data.id, data });
      } else {
        console.log("No id, creating new service");
        await createService.mutateAsync(data as MentorServiceCreate);
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
    services,
    isLoading,
    isError,
    error,
    refetch,

    isSubmitting,
    setIsSubmitting,

    createService: createService.mutate,
    createServiceAsync: createService.mutateAsync,
    updateService: updateService.mutate,
    updateServiceAsync: updateService.mutateAsync,
    deleteService: deleteService.mutate,
    deleteServiceAsync: deleteService.mutateAsync,
    saveService,

    isCreating: createService.isPending,
    isUpdating: updateService.isPending,
    isDeleting: deleteService.isPending,
  };
};

/**
 * Hook for fetching services for a specific mentor by ID
 * 
 * Use this when viewing another mentor's profile
 * 
 * @param mentorId - Numeric ID of the mentor
 * @param enabled - Whether to fetch (default: true)
 */
export const useMentorServicesByMentorId = (
  mentorId: number,
  enabled: boolean = true
) => {
  return useQuery<MentorServicePublic[], Error>({
    queryKey: ['mentorServices', 'byMentor', mentorId],
    queryFn: () => toNativePromise(
      MentorsService.getMentorServicesApiV1MentorsMentorIdServicesGet({ mentorId })
    ),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled: enabled && !!mentorId,
  });
};