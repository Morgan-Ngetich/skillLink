// main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { routeTree } from "./routeTree.gen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import themeSystem from './theme';

import { Toaster } from './components/ui/toaster';

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={themeSystem}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster /> {/*This is to render the toaster gloablly */}
      </QueryClientProvider>
    </ChakraProvider>
  </StrictMode>
);
