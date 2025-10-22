import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import useToaster from '../../hooks/useToaster';
import {
  MentorSessionService,
  type MentorSessionBase,
  type MentorSessionCreate,
  type MentorSessionUpdate,
} from '@/client';
import { toNativePromise } from '@/utils/toNativePromisse';
import { getApiErrorMessage } from '@/utils/errorUtils';

export const useMentorSessions = () => {
  const toast = useToaster();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch sessions
  const {
    data: sessions,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<MentorSessionBase[], Error>({
    queryKey: ['mentorSessions'],
    queryFn: () => toNativePromise(MentorSessionService.getMySessions()),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Create session
  const createSession = useMutation<MentorSessionBase, Error, MentorSessionCreate>({
    mutationFn: (data) => toNativePromise(MentorSessionService.createSession(data)),
    onSuccess: () => {
      toast({
        id: 'create-session-success',
        title: 'Session created',
        status: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['mentorSessions'] });
    },
    onError: (error) => {
      toast({
        id: 'create-session-error',
        title: 'Failed to create session',
        description: getApiErrorMessage(error),
        status: 'error',
      });
    },
  });

  // Update session
  const updateSession = useMutation<MentorSessionBase, Error, { id: number; data: MentorSessionUpdate }>({
    mutationFn: ({ id, data }) => toNativePromise(MentorSessionService.updateSession(id, data)),
    onSuccess: () => {
      toast({
        id: 'update-session-success',
        title: 'Session updated',
        status: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['mentorSessions'] });
    },
    onError: (error) => {
      toast({
        id: 'update-session-error',
        title: 'Failed to update session',
        description: getApiErrorMessage(error),
        status: 'error',
      });
    },
  });

  // Delete session
  const deleteSession = useMutation<void, Error, number>({
    mutationFn: (id) => toNativePromise(MentorSessionService.deleteSession(id)),
    onSuccess: () => {
      toast({
        id: 'delete-session-success',
        title: 'Session deleted',
        status: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['mentorSessions'] });
    },
    onError: (error) => {
      toast({
        id: 'delete-session-error',
        title: 'Failed to delete session',
        description: getApiErrorMessage(error),
        status: 'error',
      });
    },
  });

  // Smart create/update
  const saveSession = async (
    data: Partial<MentorSessionCreate | MentorSessionUpdate> & { id?: number },
    callbacks?: { onSettled?: () => void; onSuccess?: () => void; onError?: (err: unknown) => void }
  ) => {
    setIsSubmitting(true);
    try {
      if (data.id) {
        await updateSession.mutateAsync({ id: data.id, data });
      } else {
        await createSession.mutateAsync(data as MentorSessionCreate);
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
    sessions,
    isLoading,
    isError,
    error,
    refetch,
    isSubmitting,
    setIsSubmitting,

    createSession: createSession.mutate,
    updateSession: updateSession.mutate,
    deleteSession: deleteSession.mutate,
    saveSession,

    isCreating: createSession.isPending,
    isUpdating: updateSession.isPending,
    isDeleting: deleteSession.isPending,
  };
};
