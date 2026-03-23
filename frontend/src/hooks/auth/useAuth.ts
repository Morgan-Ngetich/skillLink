import { useState } from "react"
import { useAuthQuery } from './useAuthQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase/supabaseClient';
import { useNavigate } from '@tanstack/react-router';
import { invalidateTokenCache } from "@/client/core/OpenAPI";
import { clearAuthSession, setAuthSession } from "@/hooks/auth/cookies/sessionCookies";
import { updateUserMetadataCache } from "@/hooks/auth/useSession";
import { UsersService, type UserPublic, type UserUpdate } from "@/client";
import { toNativePromise } from "@/utils/toNativePromisse";
import { getApiErrorMessage } from "@/utils/errorUtils";
import useToaster from '../public/useToaster';
import { safeSessionStorage } from "@/utils/storage";

// Helper to get the correct redirect URL for OAuth
const getOAuthRedirectUrl = () => {
  const isDevelopment = window.location.hostname === 'localhost';

  if (isDevelopment) {
    // Use current port dynamically (works for both 3000, 5173, etc.)
    return `http://localhost:${window.location.port || '3000'}/auth/callback`;
  }

  // Production: use current origin
  return `${window.location.origin}/auth/callback`;
};

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useAuthQuery();
  const toast = useToaster()

  // Update the current authenticated user
  const updateCurrentAuthUser = useMutation<UserPublic, Error, UserUpdate>({
    mutationFn: (data) => toNativePromise(UsersService.updateMeApiV1UsersMePatch({ requestBody: data })),
    onSuccess: (updatedUser) => {
      toast({
        id: 'update-user-success',
        title: 'User updated',
        status: 'success',
      });

      // UPDATE CACHE WITH NEW USER DATA
      if (updatedUser?.uuid && updatedUser?.is_mentor !== undefined) {
        updateUserMetadataCache({
          is_mentor: updatedUser.is_mentor,
          uuid: updatedUser.uuid
        });
      }

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
    // Store redirect destination BEFORE OAuth flow
    const urlParams = new URLSearchParams(window.location.search);
    const redirectToParam = urlParams.get("redirectTo") || `/`;
    console.log("redirectToParam", redirectToParam)
    safeSessionStorage.setItem('auth_redirect_after_login', redirectToParam);

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
      // PASS INITIAL METADATA (is_mentor defaults to false for new users)
      setAuthSession(data.session, { is_mentor: false, uuid: data.user.id });

      // Also cache in localStorage for client-side
      const cacheData = {
        session: data.session,
        timestamp: Date.now()
      };
      safeSessionStorage.setItem("supabase_session_cache", JSON.stringify(cacheData));
    }

    // Invalidate all the queries, remember that the user was a guest. This also Fetch backend user again
    await queryClient.invalidateQueries();

    // Navigate to callback which will handle the redirect
    navigate({ to: '/auth/callback' });
    return { data };
  };

  // When a user signs in they need to be synced with the database
  const signIn = async (email: string, password: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectToParam = urlParams.get("redirectTo") || `/`;
    safeSessionStorage.setItem('auth_redirect_after_login', redirectToParam);

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
      // SET SESSION (metadata will be fetched and cached by useAuthQuery)
      setAuthSession(data.session);

      // Also cache in localStorage for client-side
      const cacheData = {
        session: data.session,
        timestamp: Date.now()
      };
      safeSessionStorage.setItem("supabase_session_cache", JSON.stringify(cacheData));
    }

    await queryClient.invalidateQueries();

    navigate({ to: "/auth/callback" })

    return { data };
  };

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const signOut = async () => {
    setIsLoggingOut(true)
    try {
      const { error } = await supabase.auth.signOut();
      if (error) return { error };

      // CLEAR BOTH SESSION AND METADATA CACHE
      clearAuthSession()
      await queryClient.removeQueries({ queryKey: ['auth', 'user'] });
      invalidateTokenCache()

      // Redirect to home page after sign out
      navigate({ to: '/login' });
    } catch (error) {
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
    // Store intended redirect BEFORE OAuth flow starts
    const urlParams = new URLSearchParams(window.location.search);
    const redirectToParam = urlParams.get("redirectTo") || `/`; // Safe fallback
    safeSessionStorage.setItem('auth_redirect_after_login', redirectToParam);

    const redirectUrl = getOAuthRedirectUrl();

    // Debug log (remove in production)
    console.log('🔐 Google OAuth:', {
      redirectTo: redirectUrl,
      isDev: window.location.hostname === 'localhost',
      port: window.location.port,
    });

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl, // Clean URL without query params
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    return { error };
  };

  // TODO: Delete user from Supabase auth on account deletion to fully retire their UUID.
  // Skipping this risks UUID reuse — a new user assigned the same UUID could inherit stale data or permissions.
  const deleteUserMe = useMutation<void, Error, void>({
    mutationFn: () => toNativePromise(UsersService.deleteOwnAccountApiV1UsersMeDelete()),
    onSuccess: async () => {
      await supabase.auth.signOut()
      clearAuthSession();
      invalidateTokenCache();

      await queryClient.removeQueries({ queryKey: ['auth', 'user'] });
      await queryClient.invalidateQueries()
      
      navigate({ to: '/login' });
    },
    onError: (error: unknown) => {
      toast({
        id: 'delete-user-error',
        title: 'Failed to delete account',
        description: getApiErrorMessage(error),
        status: 'error',
      });
    },
  });


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
    deleteUserMe,
  };
}