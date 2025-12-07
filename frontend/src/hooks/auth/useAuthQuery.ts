import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase/supabaseClient';
import { UserService } from '../../client';
import { useSupabaseSessionReady } from '../supabase/useSupabaseSession';
import { updateUserMetadataCache } from './useSession';

export const fetchCurrentUser = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;

  if (!token) {
    return null; // gracefully handle unauthenticated state
  }
  
  try {
    const user = await UserService.getCurrentUser();
    
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
    return null; // as a fallback
  }
}

// Use Auth query for hardCore, e.g setting/profiles
export const useAuthQuery = () => {
  const ready = useSupabaseSessionReady();

  const query = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: fetchCurrentUser,
    enabled: ready, // Don't run until Supabase session is ready
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  return {
    ...query,
    isLoading: !ready || query.isLoading,
    data: query.data || null,
  };
};