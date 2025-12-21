import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { UsersService } from '@/client';
import { useSupabaseSessionReady } from '../supabase/useSupabaseSession';
import { updateUserMetadataCache } from './useSession';
import { clearAuthSession } from '@/hooks/auth/cookies/sessionCookies';

export const fetchCurrentUser = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;

  if (!token) {
    // No token - clear everything
    clearAuthSession();
    updateUserMetadataCache({ is_mentor: undefined, uuid: undefined });
    return null;
  }

  try {
    const user = await UsersService.getMeApiV1UsersMeGet();

    // CRITICAL: If backend returns null/error, the token is invalid
    if (!user) {
      console.warn('Backend returned no user - session invalid');
      // Sign out from Supabase to clear the invalid session
      await supabase.auth.signOut();
      clearAuthSession();
      updateUserMetadataCache({ is_mentor: undefined, uuid: undefined });
      return null;
    }

    // UPDATE CACHE IMMEDIATELY AFTER SUCCESSFUL FETCH
    if (user?.uuid && user?.is_mentor !== undefined) {
      updateUserMetadataCache({
        is_mentor: user.is_mentor,
        uuid: user.uuid
      });
    }

    return user;
  } catch (err: unknown) {
    console.error('Failed to fetch user:', err);
    
    // Check if it's an authentication error (401, 403)
    if (err && typeof err === 'object' && 'status' in err) {
      const status = (err as { status: number }).status;
      
      if (status === 401 || status === 403) {
        console.warn('Authentication error - clearing session');
        // Backend rejected the token - clear everything
        await supabase.auth.signOut();
        clearAuthSession();
        updateUserMetadataCache({ is_mentor: undefined, uuid: undefined });
        return null;
      }
    }
    
    // For other errors (network issues, etc), return null but don't clear session
    // This prevents clearing valid sessions during temporary network issues
    return null;
  }
};

// Use Auth query for hardCore, e.g setting/profiles
export const useAuthQuery = () => {
  const ready = useSupabaseSessionReady();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: fetchCurrentUser,
    enabled: ready, // Don't run until Supabase session is ready
    staleTime: 1000 * 60 * 5, // 5 minutes - TanStack Query caches this
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        if (status === 401 || status === 403) {
          return false;
        }
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: 1000,
  });

  // Invalidate query when auth state changes (login/logout)
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      // On sign out or session changes, invalidate the TanStack Query cache
      if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
        queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
        
        // Clear lightweight metadata cache on sign out
        if (event === 'SIGNED_OUT') {
          clearAuthSession();
          updateUserMetadataCache({ is_mentor: undefined, uuid: undefined });
        }
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [queryClient]);

  return {
    ...query,
    isLoading: !ready || query.isLoading,
    data: query.data || null,
  };
};