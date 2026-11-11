import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
const isPackaged = process.env.ELECTRON === '1' || process.env.CAPACITOR === '1'

export default defineConfig({
  // Relative asset paths so Electron / Capacitor can load from local files.
  base: isPackaged ? './' : '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      // Prompt + online gate in registerUpdates.js — no silent update while offline.
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'fab-icon.svg', 'icons.svg', 'media/**/*.{jpeg,jpg,png,svg,webp}'],
      manifest: {
        name: 'Fortress',
        short_name: 'Fortress',
        description:
          'Fortress Zimbabwe — live website and installable app. Same feed on fortress-zw for everyone online.',
        theme_color: '#1c1915',
        background_color: '#f4efe8',
        display: 'standalone',
        orientation: 'any',
        start_url: './#/home',
        scope: './',
        id: '/',
        icons: [
          {
            src: 'fab-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: 'fab-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        skipWaiting: false,
        clientsClaim: false,
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/prixburg-live/],
        globPatterns: ['**/*.{js,css,html,svg,ico,png,jpg,jpeg,webp,woff2}'],
        globIgnores: ['**/media/**/*.mp4', '**/prixburg-live/**'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'fortress-pages',
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: ({ request, url }) =>
              url.origin === self.location.origin &&
              (request.destination === 'image' || /\.(?:png|jpe?g|webp|gif|svg)$/i.test(url.pathname)),
            handler: 'CacheFirst',
            options: {
              cacheName: 'fortress-images',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 60 },
            },
          },
          {
            urlPattern: ({ request, url }) =>
              url.origin === self.location.origin &&
              (request.destination === 'video' || /\.mp4$/i.test(url.pathname)),
            handler: 'CacheFirst',
            options: {
              cacheName: 'fortress-video',
              expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 30 },
              rangeRequests: true,
            },
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tesseract-cdn',
              expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/(images\.unsplash\.com|images\.pexels\.com|videos\.pexels\.com)\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fortress-remote-media',
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 14 },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
