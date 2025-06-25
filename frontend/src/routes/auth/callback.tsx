import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { supabase } from '../../hooks/supabaseClient';
import useToaster from '../../hooks/useToaster';
import { Spinner, Flex } from '@chakra-ui/react';
import { useNavigate } from '@tanstack/react-router';

function AuthCallbackPage() {
  const toast = useToaster();
  const navigate = useNavigate();
  const search = Route.useSearch(); // You can pass email in URL from signup

  useEffect(() => {
    const validateMagicLink = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!data.session || error) {
        toast(
          'Link expired or invalid',
          'Please request a new confirmation email.',
          'error'
        );

        const fallbackEmail = search.email ?? '';

        navigate({
          to: '/verify-email',
          search: { expired: 'true', email: fallbackEmail },
        });
        return;
      }

      // Auth success
      navigate({ to: '/' });
    };

    validateMagicLink();
  }, [navigate, toast, search]);

  return (
    <Flex justify="center" align="center" height="100vh">
      <Spinner color="blue.500" size="lg" />
    </Flex>
  );
}

export const Route = createFileRoute('/auth/callback')({
  validateSearch: (search: Record<string, unknown>) => {
    if (search.email && typeof search.email === 'string') {
      return { email: search.email };
    }
    return {};
  },
  component: AuthCallbackPage,
});
