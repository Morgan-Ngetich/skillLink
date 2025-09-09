// utils/sessionCookies.ts
import { setCookie, deleteCookie } from './cookies';
import { storage } from '../localstorage';

const SESSION_CACHE_KEY = "supabase_session_cache";
const SESSION_COOKIE_KEY = "sb_session";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setAuthSession(session: any): void {
  if (!session) return;

  try {
    // 1. Store full session in localStorage
    const cacheData = {
      session: session,
      timestamp: Date.now()
    };
    storage.set(SESSION_CACHE_KEY, JSON.stringify(cacheData));
    
    // 2. Store minimal session in cookie for SSR
    const minimalSession = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user: {
        id: session.user?.id,
        email: session.user?.email,
        user_metadata: session.user?.user_metadata
      }
    };
    
    let sessionStr = encodeURIComponent(JSON.stringify(minimalSession));
    
    // 3. Handle oversized cookies
    if (sessionStr.length > 3500) {
      const ultraMinimalSession = {
        access_token: session.access_token,
        user: { id: session.user?.id }
      };
      sessionStr = encodeURIComponent(JSON.stringify(ultraMinimalSession));
    }
    
    setCookie(SESSION_COOKIE_KEY, sessionStr, 7);
    console.log('✅ Session cookie set, size:', sessionStr.length, 'bytes');
    
  } catch (error) {
    console.warn('Failed to set session cookies:', error);
  }
}

export function clearAuthSession(): void {
  storage.remove(SESSION_CACHE_KEY);
  storage.remove("googleUser");
  deleteCookie(SESSION_COOKIE_KEY);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCachedSession(): any {
  try {
    const cached = storage.get(SESSION_CACHE_KEY);
    if (cached) {
      const { session, timestamp } = JSON.parse(cached);
      // Check if cache is still valid (e.g., 1 hour)
      const isExpired = Date.now() - timestamp > 60 * 60 * 1000;
      return isExpired ? null : session;
    }
  } catch (error) {
    console.warn('Failed to get cached session:', error);
  }
  return null;
}