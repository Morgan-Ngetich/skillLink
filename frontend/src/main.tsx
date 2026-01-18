import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, Spinner, Flex } from '@chakra-ui/react';
import { ColorModeScript } from '@chakra-ui/system';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routeTree } from './routeTree.gen';
import { ColorModeProvider } from '@/components/ui/colormode/color-mode';
import themeSystem from './theme';
import { Toaster } from '@/components/ui/toaster';
import { GlobalStyles } from './components/ui/GlobalStyles';
import { useSession } from './hooks/auth/useSession';
// import { MDXProvider } from '@mdx-js/react';
import { HelmetProvider } from 'react-helmet-async';

// Optimized Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000,   // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
  },
});

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: {
    queryClient,
  },
});

const App = () => {
  const { isLoading } = useSession();

  if (typeof window !== 'undefined' && isLoading) {
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
            {/* FIXED: No MDXProvider here - move it to crackmode routes only */}
            <App />
            <Toaster />
          </ColorModeProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>
);

if (typeof window !== 'undefined') {
  const container = document.getElementById("root")!;
  createRoot(container).render(<AppTree />);
}