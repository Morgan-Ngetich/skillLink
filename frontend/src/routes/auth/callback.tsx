import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { supabase } from '../../hooks/supabaseClient';
import useToaster from '../../hooks/useToaster';
import { Flex } from '@chakra-ui/react';
import { useNavigate } from '@tanstack/react-router';
import { queryClient } from '@/hooks/lib/queryClient';
import { setApiToken, syncUserToBackend, useCleanRedirect } from '@/hooks/auth/authState';
import { AuthCallbackLoader } from '@/components/common/AuthCallBackLoader';
import { storage } from '@/utils/localstorage';
import { type GoogleUserInfo } from '@/client';

const LOCAL_STORAGE_KEY = 'googleUser';

function isUserFromGoogle(user: any): boolean {
  return user?.identities?.some((i: any) => i.provider === 'google') ?? false;
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
        await setApiToken();
        await syncUserToBackend(user);
        await queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });

        // ✅ Save Google user info to localStorage
        const isGoogle = isUserFromGoogle(user);
        const email = user.email;

        if (isGoogle && email) {
          const name = user.user_metadata?.full_name || email.split('@')[0] || 'Google User';
          const avatar_url = user.user_metadata?.avatar_url

          const googleUser: GoogleUserInfo = { name, email, avatar_url };
          console.log('✅ Saving Google user to localStorage:', googleUser);
          storage.set(LOCAL_STORAGE_KEY, JSON.stringify(googleUser));
        } else {
          // Clear if not a Google user
          storage.remove(LOCAL_STORAGE_KEY);
        }

        redirect()
      } catch (err: any) {
        console.error('Error during auth callback:', err);

        const message =
          err?.body?.detail || // from OpenAPI-generated client
          err?.message ||       // standard JS error
          'Something went wrong. Please try again.';

        toast({
          id: 'auth-error', // fixed ID so only one toast for this error shows at a time
          title: 'Auth Error',
          description: message,
          status: 'error',
        });
        navigate({ to: '/login' });
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
  // validateSearch: (search: Record<string, unknown>) => {
  //   if (search.email && typeof search.email === 'string') {
  //     return { email: search.email };
  //   }
  //   return {};
  // },
  component: AuthCallbackPage,
});
