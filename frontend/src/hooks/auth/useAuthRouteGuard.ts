import { useAuth } from '@/hooks/auth/useAuth';
import { useAuthPromptStore } from '@/hooks/store/useAuthPromptStore';
import { useMatches } from '@tanstack/react-router';
import { isProtectedRoute } from '@/utils/routeGuards';

/**
 * Custom hook to manage authentication state and route guarding.
 * 
 * It checks the current user's authentication status, loading state,
 * whether the current route is protected, and if the auth prompt dialog is open.
 * 
 * @returns {object} - An object containing:
 *  - user: The current authenticated user or null if not authenticated.
 *  - isLoading: Boolean indicating if the auth status is still loading.
 *  - protectedRoute: Boolean indicating if the current route requires authentication.
 *  - promptOpen: Boolean indicating if the auth prompt dialog is currently open.
 *  - isBlocked: Boolean indicating if the current route is blocked due to auth state
 *               (loading or protected route with no user and prompt open).
 */
export function useAuthRouteGuard() {
  const { user, isLoading } = useAuth();
  const { open: promptOpen } = useAuthPromptStore();
  const matches = useMatches();

  const protectedRoute = isProtectedRoute(matches);

  // Returns true if loading or blocked (protected route, no user, prompt open)
  const isBlocked = isLoading || (protectedRoute && !user && promptOpen);

  return { user, isLoading, protectedRoute, promptOpen, isBlocked };
}
