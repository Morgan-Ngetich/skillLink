import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { supabase } from '../../hooks/supabaseClient';
import useToaster from '../../hooks/useToaster';
import { Flex } from '@chakra-ui/react';
import { useNavigate } from '@tanstack/react-router';
import { queryClient } from '@/hooks/lib/queryClient';
import { setApiToken, syncUserToBackend, useCleanRedirect } from '@/hooks/auth/authState';
import { AuthCallbackLoader } from '@/components/common/AuthCallBackLoader';

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

        await setApiToken();
        await syncUserToBackend(data.session.user);
        await queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });

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
