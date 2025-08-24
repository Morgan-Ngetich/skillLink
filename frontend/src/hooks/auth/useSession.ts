import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { type Session } from '@supabase/supabase-js';
import { storage } from '@/utils/localstorage';

const SESSION_CACHE_KEY = 'supabase_session_cache';
const GOOGLE_USER_KEY = 'googleUser';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedSession {
  session: Session | null;
  timestamp: number;
}

// Global cache to share across hook instances
let globalSessionCache: Session | null | undefined = undefined;
let initPromise: Promise<Session | null> | null = null;

export function useSessionState() {
  const [session, setSession] = useState<Session | null | undefined>(() => {
    // 1. Return global cache immediately if available
    if (globalSessionCache !== undefined) {
      return globalSessionCache;
    }

    // 2. Quick check: if no Google user in localStorage, likely not authenticated
    const googleUser = storage.get(GOOGLE_USER_KEY);
    if (!googleUser) {
      globalSessionCache = null;
      return null;
    }

    // 3. Try cached session from localStorage
    try {
      const cached = storage.get(SESSION_CACHE_KEY);
      if (cached) {
        const { session: cachedSession, timestamp }: CachedSession = JSON.parse(cached);
        const isExpired = Date.now() - timestamp > CACHE_DURATION;
        
        if (!isExpired && cachedSession) {
          globalSessionCache = cachedSession;
          return cachedSession;
        }
      }
    } catch (error) {
      console.warn('Failed to parse cached session:', error);
      storage.remove(SESSION_CACHE_KEY);
    }

    // 4. If we have Google user but no valid cache, we need to fetch
    return undefined;
  });

  useEffect(() => {
    const initializeSession = async (): Promise<Session | null> => {
      // If already initializing, return existing promise
      if (initPromise) {
        return initPromise;
      }

      // If we already have a session, return it
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
        
        // Cache in localStorage if session exists
        if (sessionData) {
          try {
            const cacheData: CachedSession = {
              session: sessionData,
              timestamp: Date.now(),
            };
            storage.set(SESSION_CACHE_KEY, JSON.stringify(cacheData));
          } catch (error) {
            console.warn('Failed to cache session:', error);
          }
        } else {
          // Clear cache if no session
          storage.remove(SESSION_CACHE_KEY);
          storage.remove(GOOGLE_USER_KEY);
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
      // Update all caches
      globalSessionCache = newSession;
      setSession(newSession);
      
      if (newSession) {
        // Cache the new session
        try {
          const cacheData: CachedSession = {
            session: newSession,
            timestamp: Date.now(),
          };
          storage.set(SESSION_CACHE_KEY, JSON.stringify(cacheData));
        } catch (error) {
          console.warn('Failed to cache session on auth change:', error);
        }
      } else {
        // Clear all caches on sign out
        storage.remove(SESSION_CACHE_KEY);
        storage.remove(GOOGLE_USER_KEY);
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, [session]);

  return session;
}

// Lightweight auth check hook
export function useSession() {
  const session = useSessionState();
  const isLoading = session === undefined;
  const user = session?.user ?? null;

  return {
    session,
    user,
    isLoading,
    isAuthenticated: Boolean(user),
  };
}