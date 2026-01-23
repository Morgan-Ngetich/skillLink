import { useEffect, useState } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { type Session } from '@supabase/supabase-js';
import { getCookie, deleteCookie } from '@/hooks/auth/cookies/cookies';
import { setAuthSession, clearAuthSession, getCachedSession, getCachedUserMetadata } from '@/hooks/auth/cookies/sessionCookies';
import { useQueryClient } from '@tanstack/react-query';
import type { fetchCurrentUser } from '@/hooks/auth/useAuthQuery'; // Import the type
import { safeSessionStorage } from '@/utils/storage';

const SESSION_COOKIE_KEY = 'sb_session';
const GOOGLE_USER_KEY = 'googleUser';

// Global cache to share across hook instances
let globalSessionCache: Session | null | undefined = undefined;
let globalUserMetadataCache: { is_mentor?: boolean; uuid?: string } | null = null;
let initPromise: Promise<Session | null> | null = null;

// Validate the session structure
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isValidSession(session: any): session is Session {
  return session &&
    typeof session === 'object' &&
    session.access_token &&
    session.refresh_token &&
    session.user;
}

export function useSessionState() {
  const [session, setSession] = useState<Session | null | undefined>(() => {
    // 1. Return global cache immediately if available
    if (globalSessionCache !== undefined) {
      return globalSessionCache;
    }

    // 2. Try to get session from cookie (available during SSR)
    try {
      const sessionCookie = getCookie(SESSION_COOKIE_KEY);
      if (sessionCookie) {
        const parsedSession = JSON.parse(decodeURIComponent(sessionCookie));
        if (isValidSession(parsedSession)) {
          globalSessionCache = parsedSession;
          // Also cache user metadata from cookie
          if (parsedSession.user?.user_metadata) {
            globalUserMetadataCache = {
              is_mentor: parsedSession.user.user_metadata.is_mentor,
              uuid: parsedSession.user.user_metadata.uuid
            };
          }
          return parsedSession;
        } else {
          // Invalid session in cookie, clear it
          deleteCookie(SESSION_COOKIE_KEY);
        }
      }
    } catch (error) {
      console.warn('Failed to parse session cookie:', error);
      deleteCookie(SESSION_COOKIE_KEY);
    }

    // 3. Try to get from localStorage cache
    const cachedSession = getCachedSession();
    if (cachedSession) {
      globalSessionCache = cachedSession;
      // Try to get cached user metadata
      const cachedMetadata = getCachedUserMetadata();
      if (cachedMetadata) {
        globalUserMetadataCache = cachedMetadata;
      }
      return cachedSession;
    }

    // 4. Quick check: if no Google user, likely not authenticated
    if (typeof window !== "undefined") {
      const googleUser = safeSessionStorage.getItem(GOOGLE_USER_KEY);
      if (!googleUser) {
        globalSessionCache = null;
        globalUserMetadataCache = null;
        return null;
      }
    }

    return undefined;
  });

  useEffect(() => {
    const initializeSession = async (): Promise<Session | null> => {
      if (initPromise) {
        return initPromise;
      }

      if (globalSessionCache !== undefined) {
        return globalSessionCache;
      }

      initPromise = supabase.auth.getSession().then(({ data, error }) => {
        if (error) {
          console.error('Error fetching session:', error);
        }

        const sessionData = data?.session ?? null;

        // Update global cache
        globalSessionCache = sessionData;

        if (sessionData && isValidSession(sessionData)) {
          // Cache with existing metadata if available
          setAuthSession(sessionData, globalUserMetadataCache || undefined);
        } else {
          clearAuthSession();
        }

        initPromise = null;
        return sessionData;
      });

      return initPromise;
    };

    // Only initialize if we don't have a session yet
    if (session === undefined) {
      initializeSession().then(setSession);
    }

    // Set up auth state change listener
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      // CHECK IF SESSION ACTUALLY CHANGED
      const currentSessionStr = JSON.stringify(globalSessionCache);
      const newSessionStr = JSON.stringify(newSession);

      if (currentSessionStr === newSessionStr) {
        return; // No actual change, avoid infinite loop
      }

      globalSessionCache = newSession;
      setSession(newSession);

      if (newSession && isValidSession(newSession)) {
        setAuthSession(newSession, globalUserMetadataCache || undefined);
      } else {
        clearAuthSession();
        globalUserMetadataCache = null;
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, [session]);

  return session;
}

// Auth check hook
export function useSession() {
  const session = useSessionState();
  const queryClient = useQueryClient();

  // Get the validated user from TanStack Query
  const validatedUser = queryClient.getQueryData<Awaited<ReturnType<typeof fetchCurrentUser>>>(['auth', 'user']);

  const isLoading = session === undefined && typeof window !== 'undefined';
  const user = session?.user ?? null;

  // Return cached metadata for instant UI decisions
  const cachedMetadata = globalUserMetadataCache || getCachedUserMetadata();

  return {
    session,
    user,
    isLoading,
    // IMPORTANT: Only consider authenticated if backend validated OR validation is pending
    // This prevents showing "not authenticated" during initial load
    isAuthenticated: Boolean(user && (validatedUser !== null || validatedUser === undefined)),
    // Flag to show if we have a session but haven't validated with backend yet
    isPendingValidation: Boolean(user && validatedUser === undefined),
    // Expose cached user metadata
    cachedUserMetadata: cachedMetadata,
  };
}

// Function to update user metadata cache (call this when you fetch user data)
export function updateUserMetadataCache(metadata: { is_mentor?: boolean; uuid?: string }) {
  globalUserMetadataCache = metadata;

  // Update the session cache with new metadata
  if (globalSessionCache) {
    setAuthSession(globalSessionCache, metadata);
  }
}