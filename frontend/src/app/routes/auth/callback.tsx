import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { supabase } from '@/hooks/supabase/supabaseClient';
import useToaster from '@/hooks/public/useToaster';
import { Flex } from '@chakra-ui/react';
import { useNavigate } from '@tanstack/react-router';
import { queryClient } from '@/hooks/lib/queryClient';
import { syncUserToBackend, useCleanRedirect } from '@/hooks/auth/authState';
import { AuthCallbackLoader } from '@/components/common/AuthCallBackLoader';
import { type GoogleUserInfo, type Identity, type SupabaseUser } from '@/hooks/auth/types';
import { getApiErrorMessage } from '@/utils/errorUtils';
import { setAuthSession, clearAuthSession } from "@/hooks/auth/cookies/sessionCookies"
import { safeSessionStorage } from '@/utils/storage';

const LOCAL_STORAGE_KEY = 'googleUser';

function isUserFromGoogle(user: SupabaseUser): boolean {
  return user?.identities?.some((i: Identity) => i.provider === 'google') ?? false;
}

function AuthCallbackPage() {
  const toast = useToaster();
  const navigate = useNavigate();
  const redirect = useCleanRedirect()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!data?.session || error) {
          throw new Error('Session expired or invalid');
        }

        const user = data.session.user;
        // await setApiToken();

        await new Promise(resolve => setTimeout(resolve, 100));

        if (user) {
          console.log("callback User:", user)
          await syncUserToBackend(user);
          await queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
        } else {
          return new Error('No user found in session');
        }


        // cache the session for faster susbsequent loads
        setAuthSession(data.session)

        // Save Google user info to localStorage
        const isGoogle = isUserFromGoogle(user);
        const email = user.email;

        if (isGoogle && email) {
          const name = user.user_metadata?.full_name || email.split('@')[0] || 'Google User';
          const avatar_url = user.user_metadata?.avatar_url

          const googleUser: GoogleUserInfo = { name, email, avatar_url };
          console.log(' Saving Google user to localStorage:', googleUser);
          safeSessionStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(googleUser));
        } else {
          // Clear if not a Google user
          safeSessionStorage.removeItem(LOCAL_STORAGE_KEY);
        }

        redirect()
      } catch (err: unknown) {
        console.error('Error during auth callback:', err);

        // clear caches on error
        clearAuthSession()

        toast({
          id: 'auth-error',
          title: 'Auth Error',
          description: getApiErrorMessage(err),
          status: 'error',
        });

        navigate({ to: '/login' });
      }
    };

    handleCallback();
  }, [navigate, redirect, toast]);


  return (
    <Flex justify="center" align="center" height="100vh">
      <AuthCallbackLoader />
    </Flex>
  );
}

export const Route = createFileRoute('/auth/callback')({
  // validateSearch: (search: Record<string, unknown>) => {
  //   if (search.email && typeof search.email === 'string') {
  //     return { email: search.email };
  //   }
  //   return {};
  // },
  component: AuthCallbackPage,
});
