import { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { OpenAPI, UsersService } from '@/client';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import type { GoogleUserInfo, SupabaseUser } from './types';
import { safeSessionStorage } from '@/utils/storage';

export async function isLoggedIn() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return Boolean(session?.user);
}

/* This hook is used *after login or signup* to redirect the user
  back to the page they originally intended to visit.
  it reads the "redirectTo" query param from the URL and navigates to it.
*/
export function useCleanRedirect(paramKey = 'redirectTo') {
  const navigate = useNavigate();
  const routerState = useRouterState();

  return () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const search = routerState.location.search as Record<string, any>;
    const redirectTo = search[paramKey] as string | undefined;

    // Check if the user came from /crackmode
    const cameFromCrackmode = document.referrer.includes('/crackmode') || routerState.location.pathname.includes('/crackmode');

    const fallbackUrl = cameFromCrackmode ? '/crackmode' : '/';

    if (redirectTo) {
      // Remove the redirectTo param from search
      const { [paramKey]: _discard, ...rest } = search;
      void _discard; // <-- just reference it to silence unused var warning

      navigate({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        to: redirectTo as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        search: ((prev: any) => ({ ...prev, ...rest, [paramKey]: undefined })) as any,
        replace: true,
      });
    } else {
      // No redirect param, use fallback based on where they came from
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navigate({ to: fallbackUrl as any, replace: true });
    }
  };
}


/* This hook is used *before* login or signup navigation,
    to remember where the user was before we redirect them to auth.
    It stores the current path in a query param like: /login?redirectTo=/original-page
*/
export function useNavigateWithRedirect() {
  const navigate = useNavigate();
  const routerState = useRouterState();

  return (path: string, redirectTarget?: string) => {
    const redirectToState = redirectTarget || routerState.location.pathname;

    navigate({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to: path as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      search: ((prev: any) => ({ ...prev, redirectTo: redirectToState })) as any,
      replace: true,
    });
  };
}


// This is used to set the OPENAPI client token before syncing the user.
export const setApiToken = async () => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error("No access token available");
  OpenAPI.TOKEN = token;
};


export const syncUserToBackend = async (user: SupabaseUser, maxRetries = 3) => {
  const { id: user_id, email, user_metadata } = user;

  if (!email) {
    throw new Error("User email is undefined");
  }

  const full_name = user_metadata?.full_name ?? email.split("@")[0];
  const avatar_url = user_metadata?.avatar_url ?? undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await UsersService.syncUserApiV1UsersSyncPost({
        requestBody: {
          user_id,
          email,
          full_name,
          avatar_url,
        }
      });
      console.log(`Sync successful on attempt ${attempt}`);
      return; // Success!
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.status === 401 && attempt < maxRetries) {
        // Authentication not ready yet, wait and retry
        const delay = 500 * attempt; // Exponential backoff
        console.log(`Auth not ready, retrying in ${delay}ms (attempt ${attempt})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error
    }
  };
}

const LOCAL_STORAGE_KEY = 'googleUser';

export function useGoogleUser(): GoogleUserInfo | null {
  const [googleUser, setGoogleUser] = useState<GoogleUserInfo | null>(null);

  useEffect(() => {
    const stored = safeSessionStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as GoogleUserInfo;
        setGoogleUser(parsed);
      } catch {
        safeSessionStorage.removeItem(LOCAL_STORAGE_KEY);
        setGoogleUser(null);
      }
    }
  }, []);

  return googleUser;
}