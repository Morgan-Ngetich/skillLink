import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import useToaster from '../public/useToaster';
import {
  MentorsService,
  type MentorSessionPublic,
  type MentorSessionCreate,
  type MentorSessionUpdate,
} from '@/client';
import { toNativePromise } from '@/utils/toNativePromisse';
import { getApiErrorMessage } from '@/utils/errorUtils';

/**
 * Hook for managing mentor sessions (current user's sessions)
 * 
 * For fetching another mentor's sessions, use `useMentorSessionsByMentorId` instead
 */
export const useMentorSessions = ({ enabled = true } = {}) => {
  const toast = useToaster();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch current user's sessions
  const {
    data: sessions,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<MentorSessionPublic[], Error>({
    queryKey: ['mentorSessions'],
    queryFn: () => toNativePromise(
      MentorsService.listSessionsApiV1MentorsSessionsGet({})
    ),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled,
    refetchOnMount: false,
  });

  // Create session
  const createSession = useMutation<MentorSessionPublic, Error, MentorSessionCreate>({
    mutationFn: (data) => toNativePromise(
      MentorsService.createSessionApiV1MentorsSessionsPost({
        requestBody: data
      })
    ),
    onSuccess: () => {
      toast({
        id: 'create-session-success',
        title: 'Session created',
        status: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
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
  const updateSession = useMutation<
    MentorSessionPublic,
    Error,
    { id: number; data: MentorSessionUpdate }
  >({
    mutationFn: ({ id, data }) =>
      toNativePromise(
        MentorsService.updateSessionApiV1MentorsSessionsSessionIdPatch({
          sessionId: id,
          requestBody: data
        })
      ),
    onSuccess: () => {
      toast({
        id: 'update-session-success',
        title: 'Session updated',
        status: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
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

  // Delete session (soft delete - marks as cancelled)
  const deleteSession = useMutation<void, Error, number>({
    mutationFn: (id) => toNativePromise(
      MentorsService.cancelSessionApiV1MentorsSessionsSessionIdDelete({
        sessionId: id
      })
    ),
    onSuccess: () => {
      toast({
        id: 'delete-session-success',
        title: 'Session cancelled',
        description: 'The session has been marked as cancelled',
        status: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['mentorSessions'] });
    },
    onError: (error) => {
      toast({
        id: 'delete-session-error',
        title: 'Failed to cancel session',
        description: getApiErrorMessage(error),
        status: 'error',
      });
    },
  });

  // Toggle session visibility
  const toggleVisibility = useMutation<MentorSessionPublic, Error, number>({
    mutationFn: (id) => toNativePromise(
      MentorsService.toggleSessionVisibilityApiV1MentorsSessionsSessionIdTogglePublicPatch({
        sessionId: id
      })
    ),
    onSuccess: (data) => {
      toast({
        id: 'toggle-visibility-success',
        title: 'Session visibility updated',
        description: `Session is now ${data.is_public ? 'public' : 'private'}`,
        status: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      queryClient.invalidateQueries({ queryKey: ['mentorSessions'] });
    },
    onError: (error) => {
      toast({
        id: 'toggle-visibility-error',
        title: 'Failed to update visibility',
        description: getApiErrorMessage(error),
        status: 'error',
      });
    },
  });

  // Smart create/update helper
  const saveSession = async (
    data: Partial<MentorSessionCreate | MentorSessionUpdate> & { id?: number },
    callbacks?: {
      onSettled?: () => void;
      onSuccess?: () => void;
      onError?: (err: unknown) => void;
    }
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
    // Data
    sessions,
    isLoading,
    isError,
    error,

    // Actions
    refetch,
    isSubmitting,
    setIsSubmitting,

    // Mutations
    createSession: createSession.mutate,
    createSessionAsync: createSession.mutateAsync,
    updateSession: updateSession.mutate,
    updateSessionAsync: updateSession.mutateAsync,
    deleteSession: deleteSession.mutate,
    deleteSessionAsync: deleteSession.mutateAsync,
    toggleVisibility: toggleVisibility.mutate,
    toggleVisibilityAsync: toggleVisibility.mutateAsync,
    saveSession,

    // Loading states
    isCreating: createSession.isPending,
    isUpdating: updateSession.isPending,
    isDeleting: deleteSession.isPending,
    isTogglingVisibility: toggleVisibility.isPending,
  };
};


/**
 * Hook for fetching sessions for a specific mentor by ID
 * 
 * Use this when viewing another mentor's profile
 * 
 * @param mentorId - Numeric ID of the mentor
 * @param enabled - Whether to fetch (default: true)
 */
export const useMentorSessionsByMentorId = (
  mentorId: number,
  enabled: boolean = true
) => {
  return useQuery<MentorSessionPublic[], Error>({
    queryKey: ['mentorSessions', 'byMentor', mentorId],
    queryFn: () => toNativePromise(
      MentorsService.getMentorSessionsApiV1MentorsMentorIdSessionsGet({ mentorId })
    ),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled: enabled && !!mentorId,
  });
};


/**
 * Hook for fetching a specific session by UUID
 * 
 * @param sessionUuid - UUID of the session
 * @param enabled - Whether to fetch (default: true)
 */
export const useSessionByUuid = (
  sessionUuid: string,
  enabled: boolean = true
) => {
  return useQuery<MentorSessionPublic, Error>({
    queryKey: ['mentorSession', sessionUuid],
    queryFn: () => toNativePromise(
      MentorsService.getSessionApiV1MentorsSessionsSessionUuidGet({ sessionUuid })
    ),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled: enabled && !!sessionUuid,
  });
};