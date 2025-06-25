// main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, Spinner, Flex } from '@chakra-ui/react';
import { routeTree } from "./routeTree.gen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import themeSystem from './theme';

import { Toaster } from './components/ui/toaster';
import { useSupabaseSessionReady } from './hooks/useSupabaseSession';

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
});

const App = () => {
  const ready = useSupabaseSessionReady();

  if (!ready) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner color="blue.500" size="lg" />
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
      <App />
    </ChakraProvider>
  </StrictMode>
);
