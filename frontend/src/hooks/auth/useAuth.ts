// hooks/useAuth.ts
import { useAuthQuery } from './useAuthQuery';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { OpenAPI } from '../../client';

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useAuthQuery();

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) return { error };

    // Fetch backend user again
    await queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });

    return { data };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        return { error: { message: 'Please verify your email before logging in.' } };
      }
      return { error };
    }

    await queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });

    return { data };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return { error };

    OpenAPI.TOKEN = '';
    await queryClient.removeQueries({ queryKey: ['auth', 'user'] });
  };

  return {
    user,
    isLoading,
    signUp,
    signIn,
    signOut,
  };
}
