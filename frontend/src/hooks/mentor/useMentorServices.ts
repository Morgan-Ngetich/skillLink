import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import useToaster from '../public/useToaster'
import {
  MentorServiceService,
  type MentorServiceBase,
  type MentorServiceCreate,
  type MentorServiceUpdate,
  type MentorServicePublic,
} from '@/client';
import { toNativePromise } from '@/utils/toNativePromisse';
import { getApiErrorMessage } from '@/utils/errorUtils';

export const useMentorServices = () => {
  const toast = useToaster();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: services,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<MentorServicePublic[], Error>({
    queryKey: ['mentorServices'],
    queryFn: () => toNativePromise(MentorServiceService.getMyServices()),
    staleTime: 1000 * 60 * 5,
  });

  const createService = useMutation<MentorServiceBase, Error, MentorServiceCreate>({
    mutationFn: (data) => toNativePromise(MentorServiceService.createService(data)),
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

  const updateService = useMutation<MentorServiceBase, Error, { id: number; data: MentorServiceUpdate }>({
    mutationFn: ({ id, data }) => toNativePromise(MentorServiceService.updateService(id, data)),
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

  const deleteService = useMutation<void, Error, number>({
    mutationFn: (id) => toNativePromise(MentorServiceService.deleteService(id)),
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

  const saveService = async (
    data: Partial<MentorServiceCreate | MentorServiceUpdate> & { id?: number },
    callbacks?: { onSettled?: () => void; onSuccess?: () => void; onError?: (err: unknown) => void }
  ) => {
    setIsSubmitting(true);
    try {
      if (data.id) {
        console.log("Founf the data.id", data.id)
        await updateService.mutateAsync({ id: data.id, data });
      } else {
        console.log("Nop, its the backend")
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
    updateService: updateService.mutate,
    deleteService: deleteService.mutate,
    saveService,
    
    isCreating: createService.isPending,
    isUpdating: updateService.isPending,
    isDeleting: deleteService.isPending,
  };
};
