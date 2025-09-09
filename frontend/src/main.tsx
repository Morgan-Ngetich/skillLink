import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, Spinner, Flex } from '@chakra-ui/react';
import { ColorModeScript } from '@chakra-ui/system';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routeTree } from './routeTree.gen';
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

  // Only show spinner if we're on client AND loading AND no cached session
  if (typeof window !== 'undefined' && isLoading) {
    // Check if we have a session cookie to avoid unnecessary spinner
    const hasSessionCookie = document.cookie.includes('sb-session');
    
    if (!hasSessionCookie) {
      return (
        <Flex justify="center" align="center" height="100vh">
          <Spinner color="teal.500" size="xl" />
        </Flex>
      );
    }
  }

  return <RouterProvider router={router} />;
};

const AppTree = () => (
  <StrictMode>
    <ColorModeScript initialColorMode="system" />
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

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  const container = document.getElementById("root")!;

  // For no hydration, we just render the app without hydrating
  // This means the client will start fresh without trying to reconcile with server HTML
  createRoot(container).render(<AppTree />);
}