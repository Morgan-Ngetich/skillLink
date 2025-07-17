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
    throw new Error('No session token');
  }

  // Only set token if changed
  if (lastToken !== token) {
    OpenAPI.TOKEN = () => Promise.resolve(token);
    lastToken = token;
  }

  const user = await UserService.getCurrentUser();
  return user;
};

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
