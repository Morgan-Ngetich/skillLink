// This is the SSR server entry point.
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ChakraProvider } from '@chakra-ui/react'
import { ColorModeProvider } from '@/components/ui/color-mode'
import { MDXProvider } from '@mdx-js/react'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from '@/routeTree.gen'
import MDXComponents from '@/crackmode/components/MDXComponents'
import themeSystem from '@/theme'

interface RenderResult {
  html: string;
  head: {
    title: string;
    meta: string;
    link: string;
    script: string;
  }
}

export async function render(url: string): Promise<RenderResult> {
  const helmetContext = {}

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        retry: false,
        refetchOnWindowFocus: false,
      }
    }
  })

  // Crate memory history for SSR
  const memmoryHistory = createMemoryHistory({
    initialEntries: [url]
  })

  // Create router with memory history
  const router = createRouter({
    routeTree,
    history: memmoryHistory,
    context: {
      queryClient
    }
  })

  // Wait for router to be ready
  await router.load()

  const html = renderToString(
    <StrictMode>
      <HelmetProvider context={helmetContext}>
        <QueryClientProvider client={queryClient}>
          <ChakraProvider value={themeSystem}>
            <ColorModeProvider forcedTheme="light"> {/* Force light theme for SSR */}
              <MDXProvider components={MDXComponents}>
                <RouterProvider router={router} />
              </MDXProvider>
            </ColorModeProvider>
          </ChakraProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </StrictMode>
  )


  // Extract helmet data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { helmet } = helmetContext as any

  return {
    html,
    head: helmet ? {
      title: helmet.title.toString(),
      meta: helmet.meta.toString(),
      link: helmet.link.toString(),
      script: helmet.script.toString(),
    } : {
      title: '',
      meta: '',
      link: '',
      script: ''
    }
  }
}