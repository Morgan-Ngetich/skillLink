import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { UserService, OpenAPI } from '../../client';
import { useSupabaseSessionReady } from '../useSupabaseSession';

export const fetchCurrentUser = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;

  if (!token) {
    throw new Error('No session token');
  }

  OpenAPI.TOKEN = () => Promise.resolve(token);

  const user = await UserService.getCurrentUser();
  return user
};

// Use Auth query for hardCore, e.g setting/profiles
export const useAuthQuery = () => {
  const ready = useSupabaseSessionReady();

  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: fetchCurrentUser,
    enabled: ready, // Don't run until Supabase session is ready
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}