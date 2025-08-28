import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ChakraProvider,
  Spinner,
  Flex
} from '@chakra-ui/react';

import { routeTree } from './routeTree.gen';
import {
  RouterProvider,
  createRouter
} from '@tanstack/react-router';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ColorModeProvider } from '@/components/ui/color-mode';
import themeSystem from './theme';
import { Toaster } from '@/components/ui/toaster';
import { GlobalStyles } from './components/ui/GlobalStyles';
import { useSession } from './hooks/auth/useSession';

import { MDXProvider } from '@mdx-js/react';
import MDXComponents from '@/crackmode/components/MDXComponents';
import { HelmetProvider } from 'react-helmet-async';

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
});

const App = () => {
  const { isLoading } = useSession();

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner color="teal.500" size="xl" />
      </Flex>
    );
  }

  return <RouterProvider router={router} />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider value={themeSystem}>
          <ColorModeProvider>
            <GlobalStyles />
            <MDXProvider components={MDXComponents}>
              <App />
              <Toaster />
            </MDXProvider>
          </ColorModeProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>
);
