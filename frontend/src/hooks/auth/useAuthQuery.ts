// hooks/useAuthQuery.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { UserService, OpenAPI } from '../../client';

export const fetchCurrentUser = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;

  if (!token) {
    throw new Error('No session token');
  }

  OpenAPI.TOKEN = token;
  return await UserService.getCurrentUser();
};

export const useAuthQuery = () =>
  useQuery({
    queryKey: ['auth', 'user'],
    queryFn: fetchCurrentUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
