import { useQuery, useQueryClient, QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { UserPublic, UsersService } from '@/client';
import { useSupabaseSessionReady } from '../supabase/useSupabaseSession';
import { updateUserMetadataCache } from './useSession';
import { clearAuthSession } from '@/hooks/auth/cookies/sessionCookies';

// Singleton query client for use outside React components
let globalQueryClient: QueryClient | null = null;

export const setGlobalQueryClient = (client: QueryClient) => {
  globalQueryClient = client;
};

const getUserData = async (): Promise<UserPublic | null> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;

  if (!token) {
    clearAuthSession();
    updateUserMetadataCache({ is_mentor: undefined, uuid: undefined });
    return null;
  }

  try {
    const user = await UsersService.getMeApiV1UsersMeGet();

    if (!user) {
      console.warn('Backend returned no user - session invalid');
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
    
    if (err && typeof err === 'object' && 'status' in err) {
      const status = (err as { status: number }).status;
      
      if (status === 401 || status === 403) {
        console.warn('Authentication error - clearing session');
        await supabase.auth.signOut();
        clearAuthSession();
        updateUserMetadataCache({ is_mentor: undefined, uuid: undefined });
        return null;
      }
    }
    
    return null;
  }
};

export const fetchCurrentUser = async (options?: { skipCache?: boolean }) => {
  const queryClient = globalQueryClient;
  
  if (!queryClient) {
    // Fallback if query client not set (shouldn't happen in normal use)
    console.warn('Query client not initialized, fetching directly');
    return getUserData();
  }

  if (options?.skipCache) {
    // Force fresh fetch and update cache
    return await queryClient.fetchQuery<UserPublic | null>({
      queryKey: ['auth', 'user'],
      queryFn: getUserData,
      staleTime: 0,
    });
  }

  // Try to get from cache first
  const cachedData = queryClient.getQueryData<UserPublic | null>(['auth', 'user']);
  
  if (cachedData !== undefined) {
    return cachedData;
  }

  // If not in cache, fetch and cache it
  return await queryClient.fetchQuery<UserPublic | null>({
    queryKey: ['auth', 'user'],
    queryFn: getUserData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Use Auth query for components
export const useAuthQuery = () => {
  const ready = useSupabaseSessionReady();
  const queryClient = useQueryClient();

  // Set global query client on first use
  useEffect(() => {
    setGlobalQueryClient(queryClient);
  }, [queryClient]);

  const query = useQuery<UserPublic | null>({
    queryKey: ['auth', 'user'],
    queryFn: getUserData,
    enabled: ready,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        if (status === 401 || status === 403) {
          return false;
        }
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
  });

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
        queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
        
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