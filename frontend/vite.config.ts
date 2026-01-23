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
      nitro(),  // CRITICAL for TanStack Start SSR
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
      },
    },
    
    ssr: {
      noExternal: ['@chakra-ui/react'],
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
      },
    },
    
    build: {
      target: 'es2020',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (id.includes('fuse.js')) return 'vendor-search'
            if (id.includes('recharts')) return 'vendor-charts'
            if (id.includes('axios')) return 'vendor-http'
            if (id.includes('supabase')) return 'vendor-supabase'

            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react'
            }

            if (id.includes('@tanstack')) {
              return 'vendor-tanstack'
            }

            if (id.includes('@chakra-ui') || id.includes('@emotion')) {
              return 'vendor-chakra'
            }

            if (id.includes('framer-motion')) {
              return 'vendor-animation'
            }

            if (id.includes('node_modules')) {
              return 'vendor-other'
            }
          },
        },
      },
    },
  }
})