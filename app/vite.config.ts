import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Tauri sets TAURI_ENV_PLATFORM (and TAURI_PLATFORM) at build time.
// When present, we disable VitePWA to avoid service-worker crashes inside
// the Tauri webview. When absent (plain `vite build` for web/Vercel/Netlify),
// we enable it so the manifest + service worker are emitted and the
// installable app name actually shows up in browsers.
const isTauriBuild = !!process.env.TAURI_ENV_PLATFORM || !!process.env.TAURI_PLATFORM;

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      disable: isTauriBuild,           // OFF in Tauri, ON in web
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkOnly',
          }
        ],
        navigateFallback: null,
      },
      manifest: {
        name: 'Medstat Initiative',
        short_name: 'Medstat',
        description: 'Research and Training',
        theme_color: '#007AFF',
        background_color: '#F2F2F7',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
    proxy: {
      '/api': {
        target: 'https://medstat-3rxl.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});