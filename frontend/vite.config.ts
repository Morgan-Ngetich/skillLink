import { defineConfig, type UserConfig, type ConfigEnv} from 'vite'
import react from '@vitejs/plugin-react'
// import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'
import mdx from "@mdx-js/rollup"

export default defineConfig((configEnv: ConfigEnv): UserConfig => {
  const { mode } = configEnv;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ssrBuild = (configEnv as any).ssrBuild

  return {
    base: "/",
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
      minify: mode === 'production' ? 'terser' : false,
      terserOptions: mode === 'production' ? {
        compress: {
          // This won’t affect console.error or console.warn by default. It only drops log, info, debug, etc.
          drop_console: true,  // Removes console.log/debug/info
          drop_debugger: true  // Removes debugger statements
        }
      } : undefined,

      rollupOptions: ssrBuild ? {
        input: '/src/crackmode/components/seo/entry-server',
        external: ['fs', 'path', 'url']
      } : undefined
    },
    ssr: {
      // Don't externalize these for SSR
      noExternal: ['@tanstack/react-router', '@chakra-ui/react', 'react-helmet-async']
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

