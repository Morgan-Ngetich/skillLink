import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'
import mdx from "@mdx-js/rollup"

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      mdx({
        providerImportSource: "@mdx-js/react", // makes MDX respect <MDXProvider />
      }),
      react(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          // This won’t affect console.error or console.warn by default. It only drops log, info, debug, etc.
          drop_console: true,  // Removes console.log/debug/info
          drop_debugger: true  // Removes debugger statements
        }
      }
    },
    server: mode === 'development'
      ? {
        port: 5174,
        proxy: {
          '/api': {
            target: 'http://localhost:8000',
            changeOrigin: true,
            rewrite: (path) => path,
          },
        },
      }
      : undefined,
  };
});

