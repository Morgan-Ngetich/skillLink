import { defineConfig, type UserConfig, type ConfigEnv } from 'vite'
import viteReact from '@vitejs/plugin-react'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import { nitro } from 'nitro/vite'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig((configEnv: ConfigEnv): UserConfig => {
  const { mode } = configEnv
  const isDev = mode === 'development'

  return {
    server: {
      port: 3000,
      host: true,
      ...(isDev && {
        hmr: {
          overlay: true,
        },
        proxy: {
          '/api': {
            target: 'http://localhost:8000',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path,
          },
        },
      }),
    },

    plugins: [
      tanstackStart({
        srcDirectory: './src/app',
        router: {
          entry: './router.tsx',
          routesDirectory: './routes',
          generatedRouteTree: './routeTree.gen.ts',
        },
        start: {
          entry: './ssr.tsx',
        },
      }),
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      viteReact(),
      nitro({
        routeRules: {
          '/api/**': { proxy: 'http://localhost:8000/api/**' }
        },
        devProxy: {
          '/api': {
            target: 'http://localhost:8000',
            changeOrigin: true,
          }
        }
      }),
      process.env.ANALYZE === 'true' &&
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html',
      }),
    ].filter(Boolean),

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        'node:async_hooks': resolve(__dirname, 'src/polyfills/async-hooks.browser.ts'),
      },
      dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    },

    ssr: {
      noExternal: ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
      external: ['node:async_hooks', 'async_hooks'],
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        '@tanstack/react-router',
        '@tanstack/react-query',
        '@tanstack/react-start',
        '@chakra-ui/react',
        '@emotion/react',
        '@emotion/styled',
        'framer-motion',
        'zustand',
      ],
      exclude: ['fuse.js'],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
        alias: {
          'node:async_hooks': resolve(__dirname, 'src/polyfills/async-hooks.browser.ts'),
        },
      },
    },

    build: {
      target: 'es2020',
      chunkSizeWarningLimit: 1000,
      minify: 'terser', // Use terser for minification
      terserOptions: {
        compress: {
          drop_console: !isDev, // Remove console.* in production
          drop_debugger: !isDev, // Remove debugger statements in production
          pure_funcs: !isDev ? ['console.log', 'console.info', 'console.debug', 'console.trace'] : [], // Remove specific console methods
        },
      },
    },

    // esbuild to drop console in deps
    esbuild: {
      drop: isDev ? [] : ['console', 'debugger'],
    },
  }
})