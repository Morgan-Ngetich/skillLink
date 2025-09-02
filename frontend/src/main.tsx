import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
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
import { ColorModeScript } from '@chakra-ui/system';

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

const AppTree = () => (
  <StrictMode>
    <ColorModeScript initialColorMode="dark" />
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


// check if we are in SSR mode (hydration)
const container = document.getElementById("root")!;
if (container.innerHTML) {
  // Hrdrate if there's existing content (from SSR)
  hydrateRoot(container, <AppTree />)
} else {
  // Create root if no existing content (client-only)
  createRoot(container).render(<AppTree />)
}

