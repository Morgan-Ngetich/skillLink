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

interface RenderOptions {
  url: string;
  cookies?: string;
}

export async function render({ url, cookies }: RenderOptions): Promise<RenderResult> {
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

  // Parse cookies for auth context
  let initialAuthState = null
  if (cookies) {
    const sessionCookie = parseCookies(cookies)["sb_session"];
    if (sessionCookie) {
      try {
        initialAuthState = JSON.parse(decodeURIComponent(sessionCookie));
      } catch (error) {
        console.warn("Failed to parse auth cookie during SSR:", error);
      }
    }
  }

  const router = createRouter({
    routeTree,
    history: memoryHistory,
    context: {
      queryClient,
      auth: initialAuthState,
      req: {
        url,
        headers: {
          cookie: cookies
        }
      }
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


// Helper function to parse cookies
function parseCookies(cookieHeader: string): Record<string, string> {
  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [name, value] = cookie.split('=').map(c => c.trim());
    if (name) {
      cookies[name] = decodeURIComponent(value || '');
    }
    return cookies;
  }, {} as Record<string, string>);
}