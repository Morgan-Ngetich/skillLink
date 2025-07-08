import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { supabase } from '../../hooks/supabaseClient';
import useToaster from '../../hooks/useToaster';
import { Flex } from '@chakra-ui/react';
import { useNavigate } from '@tanstack/react-router';
import { queryClient } from '@/hooks/lib/queryClient';
import { setApiToken, syncUserToBackend } from '@/hooks/auth/authState';
import { AuthCallbackLoader } from '@/components/common/AuthCallBackLoader';

function AuthCallbackPage() {
  const toast = useToaster();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!data?.session || error) {
          toast('Session expired or invalid', 'Please sign up again.', 'error');
          navigate({ to: '/signup' });
          return;
        }

        await setApiToken();
        await syncUserToBackend(data.session.user);
        await queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });

        navigate({ to: '/' });
      } catch (err) {
        console.error('Error during auth callback:', err);
        toast('Something went wrong', 'Please try again later.', 'error');
        navigate({ to: '/signup' });
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
