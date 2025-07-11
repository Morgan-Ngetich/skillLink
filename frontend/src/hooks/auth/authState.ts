import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { OpenAPI, type GoogleUserInfo } from '@/client';
import { type SupabaseUser, UserService } from '@/client';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { storage } from "@/utils/localstorage"

export async function isLoggedIn() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return Boolean(session?.user);
}


export function useCleanRedirect(paramKey = 'redirectTo') {
  const navigate = useNavigate();
  const routerState = useRouterState();

  return () => {
    const search = routerState.location.search;
    const redirectTo = search[paramKey] as string | undefined;

    if (redirectTo) {
      // Remove the redirectTo param from search
      const { [paramKey]: _, ...rest } = search;

      navigate({
        to: redirectTo,
        search: rest,      // keep other params except redirectTo
        replace: true,     // replace current history entry
      });
    } else {
      // No redirect param, just go to root
      navigate({ to: '/', replace: true });
    }
  };
}


export function useNavigateWithRedirect() {
  const navigate = useNavigate();
  const routerState = useRouterState();

  return (path: string) => {
    const redirectToState = routerState.location.pathname;

    navigate({
      to: path,
      search: { redirectTo: redirectToState },
      replace: true,
    });
  };
}


// This is used to set the OPENAPI client token before syncing the user
export const setApiToken = async () => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error("No access token available");
  OpenAPI.TOKEN = token;
};


export const syncUserToBackend = async (user: SupabaseUser) => {
  const { id: user_id, email, user_metadata } = user;

  if (!email) {
    throw new Error("User email is undefined");
  }

  const full_name = user_metadata?.full_name ?? email.split("@")[0];
  const avatar_url = user_metadata?.avatar_url ?? undefined;

  await UserService.syncUserFromSupabase({
    user_id,
    email,
    full_name,
    avatar_url,
  });
};

const LOCAL_STORAGE_KEY = 'googleUser';

export function useGoogleUser(): GoogleUserInfo | null {
  const [googleUser, setGoogleUser] = useState<GoogleUserInfo | null>(null);

  useEffect(() => {
    const stored = storage.get(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as GoogleUserInfo;
        setGoogleUser(parsed);
      } catch {
        storage.remove(LOCAL_STORAGE_KEY);
        setGoogleUser(null);
      }
    }
  }, []);

  return googleUser;
}