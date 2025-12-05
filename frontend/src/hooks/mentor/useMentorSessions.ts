import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import useToaster from '../public/useToaster';
import {
  MentorSessionService,
  type MentorSessionBase,
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
export const useMentorSessions = () => {
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
    queryFn: () => toNativePromise(MentorSessionService.getMySessions()),
    staleTime: 1000 * 60 * 5, // 5 minutes
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
    MentorSessionBase,
    Error,
    { id: number; data: MentorSessionUpdate }
  >({
    mutationFn: ({ id, data }) =>
      toNativePromise(MentorSessionService.updateSession(id, data)),
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
    mutationFn: (id) => toNativePromise(MentorSessionService.deleteSession(id)),
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
    saveSession,

    // Loading states
    isCreating: createSession.isPending,
    isUpdating: updateSession.isPending,
    isDeleting: deleteSession.isPending,
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
    queryFn: () => toNativePromise(MentorSessionService.getMentorSessions(mentorId)),
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
    queryFn: () => toNativePromise(MentorSessionService.getSessionByUuid(sessionUuid)),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    enabled: enabled && !!sessionUuid,
  });
};


// ================== USAGE EXAMPLES ==================

/*
// Example 1: Current user's sessions
function MySessionsPage() {
  const { sessions, isLoading, createSession } = useMentorSessions();
  
  if (isLoading) return <Spinner />;
  
  return (
    <div>
      {sessions?.map(session => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}

// Example 2: View another mentor's sessions
function MentorProfilePage({ mentorId }: { mentorId: number }) {
  const { data: sessions, isLoading } = useMentorSessionsByMentorId(mentorId);
  
  if (isLoading) return <Spinner />;
  
  return (
    <div>
      <h1>Mentor's Sessions</h1>
      {sessions?.map(session => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}

// Example 3: View a specific session
function SessionDetailsPage({ sessionUuid }: { sessionUuid: string }) {
  const { data: session, isLoading } = useSessionByUuid(sessionUuid);
  
  if (isLoading) return <Spinner />;
  if (!session) return <NotFound />;
  
  return <SessionDetailModal session={session} />;
}

// Example 4: Conditional fetching
function ConditionalFetch({ mentorId, shouldFetch }: Props) {
  // Only fetch if shouldFetch is true
  const { data: sessions } = useMentorSessionsByMentorId(mentorId, shouldFetch);
  
  return <div>{sessions?.length} sessions</div>;
}
*/
