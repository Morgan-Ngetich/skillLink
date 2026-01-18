import { defineConfig, type UserConfig, type ConfigEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig((configEnv: ConfigEnv): UserConfig => {
  const { mode } = configEnv;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ssrBuild = (configEnv as any).ssrBuild
  const isDev = mode === 'development'
  const isProd = mode === 'production'

  return {
    base: "/",
    plugins: [
      react(),
      // Bundle analyzer - run with: ANALYZE=true npm run build
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
        '@': path.resolve(__dirname, './src'),
      },
    },

    build: {
      // ✅ Use esbuild for MUCH faster builds (10x faster than terser)
      minify: isProd ? 'esbuild' : false,

      // ✅ Target modern browsers for smaller bundles
      target: 'es2020',

      // ✅ CSS code splitting
      cssCodeSplit: true,

      // ✅ Reasonable chunk size warning
      chunkSizeWarningLimit: 1000,

      rollupOptions: ssrBuild ? {
        input: '/src/crackmode/components/seo/entry-server',
        external: ['fs', 'path', 'url']
      } : {
        output: {
          // ✅ CRITICAL: Manual chunks for optimal caching + lazy loading
          manualChunks: (id) => {
            // Search-related chunks (only load with crackmode)
            if (id.includes('fuse.js')) {
              return 'vendor-search';
            }

            if (id.includes('recharts')) {
              return 'vendor-recharts';
            }

            // React core - cached forever
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'vendor-react';
            }

            // TanStack - cached forever
            if (id.includes('@tanstack/react-router') || id.includes('@tanstack/react-query')) {
              return 'vendor-tanstack';
            }

            // Chakra UI - large library, separate chunk
            if (id.includes('@chakra-ui') || id.includes('@emotion')) {
              return 'vendor-chakra';
            }

            // Other node_modules
            if (id.includes('node_modules')) {
              return 'vendor-other';
            }
          },

          // ✅ Consistent naming for better caching
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        }
      }
    },

    ssr: {
      noExternal: ['@tanstack/react-router', '@chakra-ui/react', 'react-helmet-async']
    },

    // ✅ Dev server optimizations
    server: isDev ? {
      port: 5174,
      // Fast HMR
      hmr: {
        overlay: true,
      },
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path,
        },
      },
    } : undefined,

    // ✅ Pre-bundle heavy dependencies for instant dev startup
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        '@tanstack/react-router',
        '@tanstack/react-query',
        '@chakra-ui/react',
        '@emotion/react',
        '@emotion/styled',
      ],
      // Exclude HEAVY libraries from pre-bundling
      // These will be lazy-loaded when needed
      exclude: ['fuse.js']
    },

    // Faster builds with esbuild
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
      drop: isProd ? ['console', 'debugger'] : undefined,
    },
  };
});