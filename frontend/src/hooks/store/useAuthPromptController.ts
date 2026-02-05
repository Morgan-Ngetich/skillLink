import { useEffect, useRef } from 'react';
import { useLocation, useMatches } from '@tanstack/react-router';
import { useAuth } from '@/hooks/auth/useAuth';
import { isProtectedRoute } from '@/utils/routeGuards';
import { useAuthPromptStore } from './useAuthPromptStore';
import {
  isPromptDismissed,
  cleanupExpiredDismissals,
} from '@/utils/authPromptDismiss';

export function useAuthPromptController() {
  const matches = useMatches();
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const { mode, setMode, open, setOpen, dismissedThisSession, reset } = useAuthPromptStore();

  const protectedRoute = isProtectedRoute(matches);
  const dismissed = isPromptDismissed(location.pathname);

  // Track previous pathname to detect route changes
  const prevPathname = useRef(location.pathname);
  
  // Track if we've shown the prompt this session for non-protected routes
  const hasShownPromptThisSession = useRef(false);

  // Cleanup expired dismissals on mount
  useEffect(() => {
    cleanupExpiredDismissals();
  }, []);

  // Reset dismissedThisSession when route changes
  useEffect(() => {
    if (prevPathname.current !== location.pathname) {
      reset();
      prevPathname.current = location.pathname;
    }
  }, [location.pathname, reset]);

  useEffect(() => {
    // Loading state - don't show prompt
    if (isLoading) {
      if (open) {
        setOpen(false);
      }
      return;
    }

    // User is logged in - never show prompt
    if (user) {
      if (open) {
        setOpen(false);
        setMode('none');
      }
      return;
    }

    // User dismissed prompt this session - don't show again
    if (dismissedThisSession) {
      if (open) {
        setOpen(false);
        setMode('none');
      }
      return;
    }

    // Protected route - ALWAYS show prompt (even if dismissed)
    if (protectedRoute) {
      if (mode !== 'protected-only' || !open) {
        setMode('protected-only');
        setOpen(true);
      }
      return;
    }

    // Non-protected route + permanently dismissed - don't show
    if (dismissed) {
      if (open) {
        setOpen(false);
        setMode('none');
      }
      return;
    }

    // Non-protected route + not dismissed - show ONCE per session after delay
    if (!hasShownPromptThisSession.current) {
      const timer = setTimeout(() => {
        if (!user && !dismissedThisSession) {
          setMode('full');
          setOpen(true);
          hasShownPromptThisSession.current = true;
        }
      }, 3000); // Wait 3 seconds before showing

      return () => clearTimeout(timer);
    }
  }, [
    user,
    isLoading,
    protectedRoute,
    dismissed,
    dismissedThisSession,
    mode,
    open,
    setMode,
    setOpen,
    location.pathname,
  ]);
}