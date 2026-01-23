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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                'use strict';
                
                var cleanupTimer = null;
                var observer = null;
                var hasHydrated = false;
                
                /**
                 * Remove all non-standard elements from <html> and <body>
                 */
                function cleanExtensions() {
                  try {
                    var html = document.documentElement;
                    var body = document.body;
                    
                    // Clean <html> - only HEAD and BODY should exist as direct children
                    if (html && html.children) {
                      for (var i = html.children.length - 1; i >= 0; i--) {
                        var htmlChild = html.children[i];
                        var tagName = htmlChild.tagName;
                        
                        if (tagName !== 'HEAD' && tagName !== 'BODY') {
                          try {
                            html.removeChild(htmlChild);
                          } catch (e) {
                            // Silent fail - element might have been removed already
                          }
                        }
                      }
                    }
                    
                    // Clean <body> - only #root div and <script> tags allowed
                    if (body && body.children) {
                      for (var j = body.children.length - 1; j >= 0; j--) {
                        var bodyChild = body.children[j];
                        var bodyTagName = bodyChild.tagName;
                        var childId = bodyChild.id;
                        
                        // Keep: root div, script tags, and noscript tags
                        var isAllowed = 
                          childId === 'root' || 
                          bodyTagName === 'SCRIPT' || 
                          bodyTagName === 'NOSCRIPT';
                        
                        if (!isAllowed) {
                          try {
                            body.removeChild(bodyChild);
                          } catch (e) {
                            // Silent fail
                          }
                        }
                      }
                    }
                  } catch (e) {
                    // Global error handler - don't let cleanup break the page
                    console.error('Extension cleanup error:', e);
                  }
                }
                
                /**
                 * Check if a node should trigger cleanup
                 */
                function shouldCleanNode(node) {
                  if (!node || node.nodeType !== 1) return false;
                  
                  var parent = node.parentElement || node.parentNode;
                  var html = document.documentElement;
                  var body = document.body;
                  
                  // Check if added to <html> (and it's not head/body)
                  if (parent === html) {
                    var tag = node.tagName;
                    return tag !== 'HEAD' && tag !== 'BODY';
                  }
                  
                  // Check if added to <body> (and it's not root/script/noscript)
                  if (parent === body) {
                    var bodyTag = node.tagName;
                    var nodeId = node.id;
                    return nodeId !== 'root' && bodyTag !== 'SCRIPT' && bodyTag !== 'NOSCRIPT';
                  }
                  
                  return false;
                }
                
                /**
                 * Debounced cleanup on mutations
                 */
                function handleMutations(mutations) {
                  if (hasHydrated) return;
                  
                  var needsClean = false;
                  
                  try {
                    for (var i = 0; i < mutations.length; i++) {
                      var mutation = mutations[i];
                      
                      if (mutation.type === 'childList' && mutation.addedNodes) {
                        for (var j = 0; j < mutation.addedNodes.length; j++) {
                          if (shouldCleanNode(mutation.addedNodes[j])) {
                            needsClean = true;
                            break;
                          }
                        }
                      }
                      
                      if (needsClean) break;
                    }
                  } catch (e) {
                    console.error('Mutation handling error:', e);
                  }
                  
                  if (needsClean) {
                    // Debounce cleanup to avoid excessive DOM manipulation
                    if (cleanupTimer) clearTimeout(cleanupTimer);
                    cleanupTimer = setTimeout(cleanExtensions, 0);
                  }
                }
                
                /**
                 * Stop monitoring and cleanup
                 */
                function stopMonitoring() {
                  hasHydrated = true;
                  
                  if (observer) {
                    observer.disconnect();
                    observer = null;
                  }
                  
                  if (cleanupTimer) {
                    clearTimeout(cleanupTimer);
                    cleanupTimer = null;
                  }
                }
                
                /**
                 * Initialize cleanup and monitoring
                 */
                function init() {
                  // Initial cleanup
                  cleanExtensions();
                  
                  // Setup MutationObserver to catch extensions that inject during hydration
                  try {
                    observer = new MutationObserver(handleMutations);
                    
                    var html = document.documentElement;
                    var body = document.body;
                    
                    // Watch <html> for new children
                    if (html) {
                      observer.observe(html, { 
                        childList: true,
                        subtree: false // Only direct children
                      });
                    }
                    
                    // Watch <body> for new children
                    if (body) {
                      observer.observe(body, { 
                        childList: true,
                        subtree: false // Only direct children
                      });
                    }
                  } catch (e) {
                    console.error('Observer setup error:', e);
                  }
                  
                  // Stop monitoring after hydration window (3 seconds)
                  // This is enough time for React to hydrate in most cases
                  setTimeout(stopMonitoring, 3000);
                  
                  // Also stop on page visibility change (user switched tabs)
                  if (typeof document.addEventListener === 'function') {
                    document.addEventListener('visibilitychange', function() {
                      if (document.hidden) {
                        stopMonitoring();
                      }
                    }, { once: true });
                  }
                }
                
                // Run immediately if DOM is ready, otherwise wait
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', init);
                } else {
                  init();
                }
              })();
            `,
          }}
        />
        
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