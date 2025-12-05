import { useState } from "react"
import { useAuthQuery } from './useAuthQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase/supabaseClient';
import { useNavigate } from '@tanstack/react-router';
import { storage } from "@/utils/localstorage";
import { invalidateTokenCache } from "@/client/core/OpenAPI";
import { clearAuthSession, setAuthSession } from "@/utils/cookies/sessionCookies";
import { UserService, type UserPublic, type UserUpdate } from "@/client";
import { toNativePromise } from "@/utils/toNativePromisse";
import { getApiErrorMessage } from "@/utils/errorUtils";
import useToaster from '../public/useToaster';
// import { setApiToken } from './authState';

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useAuthQuery();
  const toast = useToaster()


  // Update the current authenticated user
  /**
   * Update Current Authenticated User
   * - Email, name, avatar
   */
  const updateCurrentAuthUser = useMutation<UserPublic, Error, UserUpdate>({
    mutationFn: (data) => toNativePromise(UserService.updateMe(data)),
    onSuccess: () => {
      toast({
        id: 'update-user-success',
        title: 'User updated',
        status: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
    },
    onError: (error: unknown) => {
      toast({
        id: 'update-user-error',
        title: 'Failed to update user',
        description: getApiErrorMessage(error),
        status: 'error',
      });
    },
  });


  // When a user signs up, i need to sync them with the database.
  const signUp = async (email: string, password: string, fullName: string) => {
    // TODO : Enable email redirect after signup
    // const redirectUrl = `${window.location.origin}/auth/callback?email=${encodeURIComponent(email)}`;
    // console.log('Redirect URL:', redirectUrl);

    const urlParams = new URLSearchParams(window.location.search);
    const redirectToParam = urlParams.get("redirectTo") || `/profile/${user?.uuid}`;

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

    // SET COOKIE FOR SSR
    if (data?.session) {
      setAuthSession(data.session);

      // Also cache in localStorage for client-side
      const cacheData = {
        session: data.session,
        timestamp: Date.now()
      };
      storage.set("supabase_session_cache", JSON.stringify(cacheData));
    }

    // Fetch backend user again
    await queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });

    // Navigate to sync user to the backend
    navigate({
      to: '/auth/callback',
      search: { redirectTo: redirectToParam },
    });
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

    if (data.session) {
      setAuthSession(data.session);

      // Also cache in localStorage for client-side
      const cacheData = {
        session: data.session,
        timestamp: Date.now()
      };
      storage.set("supabase_session_cache", JSON.stringify(cacheData));
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

      // Clear Cookies
      clearAuthSession()

      await queryClient.removeQueries({ queryKey: ['auth', 'user'] });
      invalidateTokenCache()

      // Redirect to home page after sign out
      navigate({ to: '/login' });
    } catch (error) {
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
    const urlParams = new URLSearchParams(window.location.search);
    const redirectToParam = urlParams.get("redirectTo") || `/profile/${user?.uuid}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectToParam)}`,
      },
    });

    return { error };
  };


  return {
    user,
    isLoading,
    isLoggingOut,

    updateCurrentAuthUser,

    signUp,
    signIn,
    signOut,

    resendVerificationEmail,

    signInWithGoogle,
  };
}
