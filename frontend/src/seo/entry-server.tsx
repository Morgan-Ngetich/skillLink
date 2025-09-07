import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react';
import { ColorModeScript } from '@chakra-ui/system';
import { ColorModeProvider } from '@/components/ui/color-mode';
import { MDXProvider } from '@mdx-js/react';
import {
  createMemoryHistory,
  createRouter,
  RouterProvider
} from '@tanstack/react-router';
import { routeTree } from '@/routeTree.gen';
import MDXComponents from '@/crackmode/components/MDXComponents';
import themeSystem from '@/theme';

interface RenderResult {
  html: string;
  head: {
    title: string;
    meta: string;
    link: string;
    script: string;
  };
}

export async function render(url: string): Promise<RenderResult> {
  const helmetContext = {};

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        retry: false,
        refetchOnWindowFocus: false,
      }
    }
  });

  const memoryHistory = createMemoryHistory({ initialEntries: [url] });

  const router = createRouter({
    routeTree,
    history: memoryHistory,
    context: {
      queryClient
    }
  });

  // Preload all data for the route
  await router.load();

  const html = renderToString(
    <StrictMode>
      <HelmetProvider context={helmetContext}>
        <QueryClientProvider client={queryClient}>
          <ChakraProvider value={themeSystem}>
            <ColorModeProvider>
              <MDXProvider components={MDXComponents}>
                <RouterProvider router={router} />
              </MDXProvider>
            </ColorModeProvider>
          </ChakraProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </StrictMode>
  );

  const colorModeScript = renderToString(
    <ColorModeScript initialColorMode="system" />
  );

  // Extract helmet data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { helmet } = helmetContext as any;

  return {
    html,
    head: helmet
      ? {
        title: helmet.title.toString(),
        meta: helmet.meta.toString(),
        link: helmet.link.toString(),
        script: helmet.script.toString() + colorModeScript,
      }
      : {
        title: '',
        meta: '',
        link: '',
        script: colorModeScript,
      }
  };
}