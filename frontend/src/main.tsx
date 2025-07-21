import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, Spinner, Flex } from '@chakra-ui/react';
import { routeTree } from "./routeTree.gen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ColorModeProvider } from '@/components/ui/color-mode';
import themeSystem from './theme';

import { Toaster } from '@/components/ui/toaster';
import { useSession } from './hooks/auth/useSession'; // <-- import your hook here
import { GlobalStyles } from './components/ui/GlobalStyles';

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

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={themeSystem}> {/* ✅ ChakraProvider wraps everything */}
      <ColorModeProvider>
      <GlobalStyles />
        <App />
      </ColorModeProvider>
    </ChakraProvider>
  </StrictMode>
);
