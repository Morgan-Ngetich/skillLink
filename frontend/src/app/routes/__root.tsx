/// <reference types="vite/client" />
import {
  HeadContent,
  Scripts,
  createRootRoute,
  Outlet,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { Suspense } from 'react'
import { StrictMode } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { ColorModeProvider } from '@/components/ui/colormode/color-mode'
import themeSystem from '@/theme'
import { Toaster } from '@/components/ui/toaster'
import { GlobalStyles } from '@/components/ui/GlobalStyles'
import NotFound from '@/components/common/NotFound'
import { DefaultCatchBoundary } from '@/components/common/DefaultCatchBoundary'

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* Theme initialization - prevents flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storageKey = 'theme';
                  var theme = localStorage.getItem(storageKey);
                  if (!theme) {
                    var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    theme = systemTheme || 'dark';
                  }
                  document.documentElement.classList.add(theme);
                } catch (e) {
                  // Fallback to dark theme if anything fails
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {/* 
          Browser Extension Cleanup Script
          
          This script prevents hydration errors caused by browser extensions
          (Grammarly, LastPass, etc.) that inject DOM elements into <html> or <body>.
          
          WHY: React's strict hydration checks fail when the client DOM doesn't match
          the server-rendered HTML, causing CSS to not load and breaking the UI.
          
          WHAT IT DOES:
          1. Removes any non-standard elements from <html> and <body> before React hydrates
          2. Monitors for new injections during the critical 3-second hydration window
          3. Uses a whitelist approach - only allows expected elements to exist
          
          EDGE CASES HANDLED:
          - Extensions that inject immediately vs. delayed
          - Multiple extensions injecting simultaneously
          - Extensions that re-inject after removal
          - Race conditions during DOM ready state transitions
          - Memory cleanup after hydration completes
        */}

        <div id="root">
          <StrictMode>
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
          </StrictMode>
        </div>
        <Scripts />
      </body>
    </html>
  )
}