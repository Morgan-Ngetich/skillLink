import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { supabase } from '@/hooks/supabase/supabaseClient';
import useToaster from '@/hooks/public/useToaster';
import { Flex } from '@chakra-ui/react';
import { useNavigate } from '@tanstack/react-router';
import { queryClient } from '@/hooks/lib/queryClient';
import { syncUserToBackend } from '@/hooks/auth/authState';
import { AuthCallbackLoader } from '@/components/common/AuthCallBackLoader';
import { type GoogleUserInfo, type Identity, type SupabaseUser } from '@/hooks/auth/types';
import { getApiErrorMessage } from '@/utils/errorUtils';
import { setAuthSession, clearAuthSession } from "@/hooks/auth/cookies/sessionCookies";
import { safeSessionStorage } from '@/utils/storage';
import { UserPublic } from '@/client';

const LOCAL_STORAGE_KEY = 'googleUser';
const REDIRECT_STORAGE_KEY = 'auth_redirect_after_login';

function isUserFromGoogle(user: SupabaseUser): boolean {
  return user?.identities?.some((i: Identity) => i.provider === 'google') ?? false;
}

function AuthCallbackPage() {
  const toast = useToaster();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 1. Get session from Supabase
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw new Error(`Auth error: ${error.message}`);
        }

        if (!data?.session) {
          throw new Error('No session found after authentication');
        }

        const { session } = data;
        const user = session.user;

        if (!user) {
          throw new Error('No user found in session');
        }

        console.log("✅ Callback User:", user);

        // 2. Set session cookie FIRST (for SSR and API calls)
        setAuthSession(session);

        // 3. Cache session in localStorage for faster loads
        const cacheData = {
          session,
          timestamp: Date.now()
        };
        safeSessionStorage.setItem("supabase_session_cache", JSON.stringify(cacheData));

        // 4. Sync user to backend database
        try {
          await syncUserToBackend(user);
        } catch (syncError) {
          console.error('Failed to sync user to backend:', syncError);
          // Don't block login if backend sync fails - user can still use the app
        }

        // 5. Invalidate auth queries to fetch fresh user data
        await queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });

        // 6. Handle Google-specific user info caching
        const isGoogle = isUserFromGoogle(user);
        const email = user.email;

        if (isGoogle && email) {
          const name = user.user_metadata?.full_name || email.split('@')[0] || 'Google User';
          const avatar_url = user.user_metadata?.avatar_url;

          const googleUser: GoogleUserInfo = { name, email, avatar_url };
          console.log('💾 Saving Google user to localStorage:', googleUser);
          safeSessionStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(googleUser));
        } else {
          // Clear if not a Google user
          safeSessionStorage.removeItem(LOCAL_STORAGE_KEY);
        }

        // 7. Get stored redirect destination (from OAuth flow)
        const redirectTo = safeSessionStorage.getItem(REDIRECT_STORAGE_KEY);
        safeSessionStorage.removeItem(REDIRECT_STORAGE_KEY);

        // 8. Determine final redirect
        let finalRedirect = '/'; // Default fallback

        if (redirectTo) {
          finalRedirect = redirectTo;
        } else if (user.id) {
          // Fallback to user profile if no redirect was stored
          const CurrentUser: UserPublic = await queryClient.fetchQuery({ queryKey: ['auth', 'user'] });
          if (CurrentUser?.uuid) {
            finalRedirect = `/profile/${CurrentUser.uuid}`;
          }
        } else {
          finalRedirect = `/`;
        }

        console.log('🔄 Redirecting to:', finalRedirect);

        // 9. Navigate to final destination
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        navigate({ to: finalRedirect as any });

      } catch (err: unknown) {
        console.error('❌ Error during auth callback:', err);

        // Clear all auth data on error
        clearAuthSession();
        safeSessionStorage.removeItem("supabase_session_cache");
        safeSessionStorage.removeItem(LOCAL_STORAGE_KEY);
        safeSessionStorage.removeItem(REDIRECT_STORAGE_KEY);

        toast({
          id: 'auth-error',
          title: 'Authentication Failed',
          description: getApiErrorMessage(err),
          status: 'error',
        });

        // Redirect to login with error message
        navigate({ 
          to: '/login',
          search: { error: 'auth_failed' }
        });
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <Flex justify="center" align="center" height="100vh">
      <AuthCallbackLoader />
    </Flex>
  );
}

export const Route = createFileRoute('/auth/callback')({
  ssr: false, // Keep this - OAuth callbacks can't be SSR
  component: AuthCallbackPage,
});