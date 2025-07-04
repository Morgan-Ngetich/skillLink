import { useAuthQuery } from './useAuthQuery';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { OpenAPI, UserService, type SupabaseUser } from '../../client';
import { useNavigate } from '@tanstack/react-router';

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useAuthQuery();

  const syncUserToBackend = async (user: SupabaseUser) => {
    const { id: user_uuid, email, user_metadata } = user;

    if (!email) {
      throw new Error("User email is undefined");
    }

    const full_name = user_metadata?.full_name ?? email.split("@")[0];
    const avatar_url = user_metadata?.avatar_url ?? undefined;

    await UserService.syncUserFromSupabase({
      user_uuid,
      email,
      full_name,
      avatar_url,
    });
  };


  // When a user signs up, i need to sunc them with the database.
  const signUp = async (email: string, password: string, fullName: string) => {
    // TODO : Enable email redirect after signup
    // const redirectUrl = `${window.location.origin}/auth/callback?email=${encodeURIComponent(email)}`;
    // console.log('Redirect URL:', redirectUrl);

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

    if (!data.user) {
      return { error: new Error("User is null after sign up") };
    }

    await syncUserToBackend(data.user);
    // Fetch backend user again
    await queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });

    return { data };
  };

  // When a user signs in they need to be synced with the database
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

    if (!data.user) {
      return { error: new Error("User is null after sign in") };
    }

    await syncUserToBackend(data.user);

    await queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });

    return { data };
  };

  const navigate = useNavigate();
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return { error };

    OpenAPI.TOKEN = '';
    await queryClient.removeQueries({ queryKey: ['auth', 'user'] });

    // Redirect to home page after sign out
    navigate({ to: '/login' });    
  };

  const resendVerificationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    return { error };
  };


  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      // options: {
      //   redirectTo: `${window.location.origin}/auth/callback`,
      // },
    });

    return { error };
  };


  return {
    user,
    isLoading,
    signUp,
    signIn,
    signOut,

    resendVerificationEmail,

    signInWithGoogle,
  };
}
