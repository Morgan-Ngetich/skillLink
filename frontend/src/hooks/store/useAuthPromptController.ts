import { useEffect } from 'react';
import { useLocation, useMatches } from '@tanstack/react-router'; // or your routing lib equivalent
import { useAuth } from '@/hooks/auth/useAuth';
import { isProtectedRoute } from '@/utils/routeGuards';
import { useAuthPromptStore } from './useAuthPromptStore';
import { isPromptDismissed } from '@/utils/authPromptDismiss';

export function useAuthPromptController() {
  const matches = useMatches();
  const location = useLocation()
  const dismissed = isPromptDismissed(location.pathname)

  const { user, isLoading } = useAuth();
  const { mode, setMode, open, setOpen } = useAuthPromptStore();

  const protectedRoute = isProtectedRoute(matches);

  useEffect(() => {
    if (isLoading) {
      // While loading, don't show anything
      setOpen(false);
      setMode('none');
      return;
    }

    // Block everything if dismissed
    if (dismissed) {
      if(open) {
        setOpen(false);
        setMode('none')
      }
      return
    }

    if (!user && protectedRoute) {
      // User is not logged in and route is protected
      // Open dialog with protected-only mode (no "stay logged out")
      if (mode !== 'protected-only' || open === false) {
        setMode('protected-only');
        setOpen(true);
      }
    } else if (!user && !protectedRoute && !dismissed) {
      // User not logged in but route not protected
      // full dialog with stay logged out option
      if (mode !== 'full' || open === false) {
        setMode('full');
        setOpen(true);
      }
    } else {
      // User logged in or no prompt needed
      if (open) {
        setOpen(false);
        setMode('none');
      }
    }
  }, [user, isLoading, protectedRoute, dismissed, mode, open, setMode, setOpen, location.pathname]);
}
