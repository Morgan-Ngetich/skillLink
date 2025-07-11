import { useState } from "react"
import { useAuthQuery } from './useAuthQuery';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { OpenAPI } from '../../client';
import { useNavigate } from '@tanstack/react-router';
// import { setApiToken } from './authState';

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useAuthQuery();

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


    // Fetch backend user again
    await queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });

    // Navigate to sync user to the backend
    navigate({ to: '/auth/callback' });
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

    await queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });

    return { data };
  };


  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const signOut = async () => {
    setIsLoggingOut(true)
    try {
      const { error } = await supabase.auth.signOut();
      if (error) return { error };

      OpenAPI.TOKEN = '';
      await queryClient.removeQueries({ queryKey: ['auth', 'user'] });

      // Redirect to home page after sign out
      navigate({ to: '/login' });
    } catch(error) {
      // TODO { toast }
      console.error(error);
    } finally {
      setIsLoggingOut(false)
    }
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
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    return { error };
  };


  return {
    user,
    isLoading,
    isLoggingOut,
    
    signUp,
    signIn,
    signOut,

    resendVerificationEmail,

    signInWithGoogle,
  };
}
