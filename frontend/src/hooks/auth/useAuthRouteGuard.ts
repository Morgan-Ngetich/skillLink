import { useAuth } from '@/hooks/auth/useAuth';
import { useAuthPromptStore } from '@/hooks/store/useAuthPromptStore';
import { useMatches } from '@tanstack/react-router';
import { isProtectedRoute } from '@/utils/routeGuards';
import { useAuthQuery } from '@/hooks/auth/useAuthQuery';
import { useSession } from './useSession';

/**
 * Custom hook to manage authentication state and route guarding.
 * 
 * It checks the current user's authentication status, loading state,
 * whether the current route is protected, and if the auth prompt dialog is open.
 * It also validates the session with the backend to ensure the token is still valid.
 * 
 * @returns {object} - An object containing:
 *  - user: The current authenticated user or null if not authenticated.
 *  - isLoading: Boolean indicating if the auth status is still loading.
 *  - protectedRoute: Boolean indicating if the current route requires authentication.
 *  - promptOpen: Boolean indicating if the auth prompt dialog is currently open.
 *  - isBlocked: Boolean indicating if the current route is blocked due to auth state
 *               (loading, validating with backend, or protected route with no validated user).
 *  - isValidated: Boolean indicating if the user has been validated with the backend.
 */
export function useAuthRouteGuard() {
  const { user, isLoading } = useAuth();
  const { isPendingValidation } = useSession()
  const { open: promptOpen } = useAuthPromptStore();
  const matches = useMatches();
  
  // Get backend-validated user
  const { data: validatedUser, isLoading: isValidating } = useAuthQuery();

  const protectedRoute = isProtectedRoute(matches);

  // User is blocked if:
  // 1. Still loading session from Supabase, OR
  // 2. Have a session but waiting for backend validation, OR
  // 3. On a protected route without a validated user and prompt is open
  const isBlocked = 
    isLoading || 
    isPendingValidation || 
    isValidating ||
    (protectedRoute && !validatedUser && promptOpen);

  // User is validated if backend has confirmed the user exists
  const isValidated = Boolean(validatedUser);

  return { 
    user: validatedUser || user, // Prefer validated user
    isLoading: isLoading || isPendingValidation || isValidating, 
    protectedRoute, 
    promptOpen, 
    isBlocked,
    isValidated,
  };
}