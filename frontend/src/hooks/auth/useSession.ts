import { useEffect, useState } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { type Session } from '@supabase/supabase-js';
import { storage } from '@/utils/localstorage';
import { getCookie, deleteCookie } from '@/utils/cookies/cookies';
import { setAuthSession, clearAuthSession, getCachedSession } from '@/utils/cookies/sessionCookies';

const SESSION_COOKIE_KEY = 'sb_session';
const GOOGLE_USER_KEY = 'googleUser';

// Global cache to share across hook instances
let globalSessionCache: Session | null | undefined = undefined;
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
      return cachedSession;
    }

    // 4. Quick check: if no Google user, likely not authenticated
    if (typeof window !== "undefined") {
      const googleUser = storage.get(GOOGLE_USER_KEY);
      if (!googleUser) {
        globalSessionCache = null;
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

        // ✅ USE SHARED UTILITY INSTEAD OF MANUAL COOKIE HANDLING
        if (sessionData && isValidSession(sessionData)) {
          setAuthSession(sessionData); // ← This handles both cookie and localStorage
        } else {
          clearAuthSession(); // ← This clears both cookie and localStorage
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
        setAuthSession(newSession);
      } else {
        clearAuthSession();
      }
    });
    
    return () => listener?.subscription.unsubscribe();
  }, [session]);

  return session;
}

// Auth check hook
export function useSession() {
  const session = useSessionState();
  const isLoading = session === undefined && typeof window !== 'undefined';
  const user = session?.user ?? null;

  return {
    session,
    user,
    isLoading,
    isAuthenticated: Boolean(user),
  };
}