import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import checker from 'vite-plugin-checker'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'biome lint . --quiet', // run biome lint
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      // includeAssets: ['vite.svg', 'favicon.svg', 'robots.txt'], // Assets in public/
      includeAssets: ['vite.svg'], 
      manifest: {
        name: 'SkillUP',
        short_name: 'skillUp',
        description: 'SkillUP-powered PWA',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/vite.svg',
            sizes: '192x192', // Vite logo may not be perfect size-wise but will work
            type: 'image/svg+xml'
          },
          {
            src: '/vite.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
