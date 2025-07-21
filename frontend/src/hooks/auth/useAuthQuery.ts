import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { UserService, OpenAPI } from '../../client';
import { useSupabaseSessionReady } from '../useSupabaseSession';

let lastToken: string | null = null; // store last token to avoid repeated assignments

export const fetchCurrentUser = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;

  if (!token) {
    // TODO throw new error. Efficiently handle session resadiness.
    // throw new Error('No session token');
    return null // gracefully handle unauthenticated state
  }

  // Only set token if changed
  if (lastToken !== token) {
    OpenAPI.TOKEN = () => Promise.resolve(token);
    lastToken = token;
  }

  try {
    const user = await UserService.getCurrentUser();
    return user;
  } catch (err: unknown) {    
    console.error('Failed to fetch user:', err);
    return null // as a fallbase
  }
}


  // Use Auth query for hardCore, e.g setting/profiles
  export const useAuthQuery = () => {
    const ready = useSupabaseSessionReady();

    const query = useQuery({
      queryKey: ['auth', 'user'],
      queryFn: fetchCurrentUser,
      enabled: ready, // Don't run until Supabase session is ready
      staleTime: 1000 * 60 * 5,
      retry: false,
    });

    return {
      ...query,
      isLoading: !ready || query.isLoading,
      data: query.data || null,
    };
  };
