import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { QueryClient } from '@tanstack/react-query'

export function createRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
      },
    },
  })

  return createTanStackRouter({
    routeTree,
    defaultPreload: 'intent',
    context: {
      queryClient,
    },
  })
}

// Export getRouter for TanStack Start
export function getRouter() {
  return createRouter()
}

// Type declarations
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
  
  interface RouteContext {
    queryClient: QueryClient
  }
}