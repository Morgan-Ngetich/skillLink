import { redirect } from "@tanstack/react-router";
import { fetchCurrentUser } from "@/hooks/auth/useAuthQuery";
import type { RouteMatch } from "@tanstack/react-router";

// RouteMatch needs 7 type arguments, but we don't care about them here.
type AnyRouteMatch = RouteMatch<unknown, unknown, unknown, unknown, unknown, unknown, unknown>;

export function isProtectedRoute(matches: AnyRouteMatch[]): boolean {
  // @ts-expect-error: TS may complain if 'route' isn't officially in type
  return matches.some(match => match.loaderData?.requiresAuth === true);
}

/**
 * Requires profile completion for ALL users
 * Use this for routes that should only be accessed by authenticated users with complete profiles
 * Examples: /dashboard, /settings, /messages /before user makes a book
 */
export async function requireProfileCompletion(location: { pathname: string; search: Record<string, string> }) {
  const user = await fetchCurrentUser();
  
  // If no user (i.e., not logged in), do nothing. Let AuthPromptDialog handle it.
  if (!user) return;

  if (!user?.profile?.is_profile_setup_complete) {
    throw redirect({
      to: "/profile-setup",
      search: {
        step: 1,
        redirectTo: location.pathname + '?' + new URLSearchParams(location.search).toString(),
      },
    });
  }
}

/**
 * SSR-SAFE: Returns consistent initial state on server
 * Actual auth check happens client-side after hydration
 * Requires profile completion if viewing YOUR OWN profile
 * Use this for public-but-ownable routes like /profile/$uuid
 * Returns requiresAuth: true if user is viewing their own profile
 */
export async function requireOwnerProfileCompletion(
  profileUuid: string,
  location: { pathname: string; search: Record<string, string> }
) {
  const isServer = typeof window === 'undefined';
  
  console.log('🔐 requireOwnerProfileCompletion - START', { 
    profileUuid,
    isServer 
  });
  
  // ALWAYS return the same initial state structure for SSR consistency
  if (isServer) {
    console.log('✅ SSR mode - returning initial state (auth check deferred to client)');
    return { 
      requiresAuth: false, 
      isOwner: false,
      profileUuid,
      needsClientAuthCheck: true // Flag for client to check
    };
  }

  // CLIENT-SIDE: Perform actual auth check
  console.log('🔐 Client mode - checking auth');
  
  try {
    const user = await fetchCurrentUser();
    console.log('🔐 User fetched:', user?.uuid);
    
    // Not logged in → Public access
    if (!user) {
      console.log('🔐 No user, allowing public access');
      return { requiresAuth: false, isOwner: false, profileUuid };
    }
    
    // Viewing someone else's profile → Public access
    if (user.uuid !== profileUuid) {
      console.log('🔐 Viewing other profile, allowing access');
      return { requiresAuth: false, isOwner: false, profileUuid };
    }
    
    // Viewing own profile but setup incomplete → Redirect to setup
    if (!user?.profile?.is_profile_setup_complete) {
      console.log('🔐 Own profile but incomplete, redirecting to setup');
      throw redirect({
        to: "/profile-setup",
        search: {
          step: 1,
          redirectTo: location.pathname + '?' + new URLSearchParams(location.search).toString(),
        },
      });
    }

    // Viewing own profile with complete setup → Protected
    console.log('🔐 Own profile and complete, marking as protected');
    return { requiresAuth: true, isOwner: true, profileUuid };
    
  } catch (error) {
    // If it's a redirect, rethrow it
    if (error && typeof error === 'object' && 'href' in error) {
      throw error;
    }
    
    console.error('🔐 Error in requireOwnerProfileCompletion:', error);
    // On error, default to public access
    return { requiresAuth: false, isOwner: false, profileUuid };
  }
}

/**
 * Helper for actions that require authentication AND profile completion.
 * Opens the AuthPromptDialog if user is not logged in.
 * Returns the current user if allowed, otherwise returns null.
 */
export async function requireAuthWithProfile(
  location: { pathname: string; search: Record<string, string> },
  openAuthPrompt: (mode: "full" | "lite") => void
) {
  const user = await fetchCurrentUser();

  // Not logged in → open AuthPromptDialog and stop
  if (!user) {
    openAuthPrompt("full"); // full mode shows "Stay logged out"
    return null;
  }

  // Logged in but profile incomplete → redirect to setup
  if (!user.profile?.is_profile_setup_complete) {
    throw redirect({
      to: "/profile-setup",
      search: {
        step: 1,
        redirectTo: location.pathname + '?' + new URLSearchParams(location.search).toString(),
      },
    });
  }

  // Authenticated and profile complete → return user
  return user;
}