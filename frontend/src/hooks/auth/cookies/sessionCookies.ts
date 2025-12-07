import { setCookie, deleteCookie } from './cookies';

const SESSION_CACHE_KEY = "supabase_session_cache";
const SESSION_COOKIE_KEY = "sb_session";
const USER_METADATA_KEY = "user_metadata_cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setAuthSession(session: any, userMetadata?: { is_mentor?: boolean; uuid?: string }): void {
  if (!session) return;

  try {
    // 1. Store full session in localStorage
    const cacheData = {
      session: session,
      timestamp: Date.now()
    };
    sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(cacheData));

    // 2. Cache user metadata separately for instant access
    console.log("Caching user metadata:", userMetadata)
    if (userMetadata) {
      sessionStorage.setItem(USER_METADATA_KEY, JSON.stringify({
        // TODO: add more user_roles if needed
        is_mentor: userMetadata.is_mentor,
        uuid: userMetadata.uuid,
        timestamp: Date.now()
      }));
    }

    // 3. Store minimal session in cookie for SSR (include is_mentor if available)
    const minimalSession = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      user: {
        id: session.user?.id,
        email: session.user?.email,
        user_metadata: {
          ...session.user?.user_metadata,
          ...(userMetadata?.is_mentor !== undefined && { is_mentor: userMetadata.is_mentor }),
          ...(userMetadata?.uuid && { uuid: userMetadata.uuid })
        }
      }
    };

    let sessionStr = encodeURIComponent(JSON.stringify(minimalSession));

    // 4. Handle oversized cookies
    if (sessionStr.length > 3500) {
      const ultraMinimalSession = {
        access_token: session.access_token,
        user: { 
          id: session.user?.id,
          user_metadata: {
            is_mentor: userMetadata?.is_mentor,
            uuid: userMetadata?.uuid
          }
        }
      };
      sessionStr = encodeURIComponent(JSON.stringify(ultraMinimalSession));
    }

    setCookie(SESSION_COOKIE_KEY, sessionStr, 7);
    console.log('Session cookie set, size:', sessionStr.length, 'bytes');

  } catch (error) {
    console.warn('Failed to set session cookies:', error);
  }
}

export function clearAuthSession(): void {
  sessionStorage.removeItem(SESSION_CACHE_KEY);
  sessionStorage.removeItem(USER_METADATA_KEY);
  sessionStorage.removeItem("googleUser");
  deleteCookie(SESSION_COOKIE_KEY);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCachedSession(): any {
  try {
    const cached = sessionStorage.getItem(SESSION_CACHE_KEY);
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

// Get cached user metadata for instant UI decisions
export function getCachedUserMetadata(): { is_mentor?: boolean; uuid?: string } | null {
  try {
    const cached = sessionStorage.getItem(USER_METADATA_KEY);
    if (cached) {
      const { is_mentor, uuid, timestamp } = JSON.parse(cached);
      // Check if cache is still valid (1 hour)
      const isExpired = Date.now() - timestamp > 60 * 60 * 1000;
      if (!isExpired) {
        return { is_mentor, uuid };
      }
    }
  } catch (error) {
    console.warn('Failed to get cached user metadata:', error);
  }
  return null;
}