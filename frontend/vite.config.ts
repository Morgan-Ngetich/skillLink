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

