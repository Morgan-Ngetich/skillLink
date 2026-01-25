/// <reference types="vite/client" />
import {
  HeadContent,
  Scripts,
  createRootRoute,
  Outlet,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { Suspense, useEffect } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { ColorModeProvider } from '@/components/ui/colormode/color-mode'
// import themeSystem from '@/theme'
import { Toaster } from '@/components/ui/toaster'
import { GlobalStyles } from '@/components/ui/GlobalStyles'
import NotFound from '@/components/common/NotFound'
import { DefaultCatchBoundary } from '@/components/common/DefaultCatchBoundary'
import themeSystem from '@/theme'

const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null
    : React.lazy(() =>
      import('@tanstack/react-router-devtools').then((res) => ({
        default: res.TanStackRouterDevtools,
      }))
    )

const fallbackQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
})

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'MENTspace | Get your Mentor' },
      { name: 'description', content: 'Master your craft. Get a Mentor, Today.' },
      { name: 'theme-color', content: '#3A3A3A' },
    ],
    links: [
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
      { rel: 'preconnect', href: 'https://backend-production-3e33.up.railway.app/' },
      { rel: 'dns-prefetch', href: 'https://backend-production-3e33.up.railway.app/' },
    ],
  }),
  component: RootComponent,
  notFoundComponent: () => <NotFound />,
  errorComponent: DefaultCatchBoundary
})

function RootComponent() {
  // Debug logging
  console.log('🎨 ROOT RENDERING', {
    isServer: typeof window === 'undefined',
    timestamp: Date.now()
  })

  useEffect(() => {
    console.log('✅ ROOT HYDRATED SUCCESSFULLY')
  }, [])

  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const routeContext = Route.useRouteContext() as RouterContext
  const queryClient = routeContext?.queryClient ?? fallbackQueryClient

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div id="root">
          <QueryClientProvider client={queryClient}>
            <ChakraProvider value={themeSystem}>
              <ColorModeProvider>
                <GlobalStyles />
                {children}
                <Toaster />
                <Suspense fallback={null}>
                  <TanStackRouterDevtools />
                </Suspense>
              </ColorModeProvider>
            </ChakraProvider>
          </QueryClientProvider>
        </div>
        <Scripts />
      </body>
    </html>
  )
}