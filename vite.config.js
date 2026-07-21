import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// If deploying to GitHub Pages at username.github.io/tether, keep base as '/tether/'.
// If deploying to a custom domain or username.github.io root, change to '/'.
export default defineConfig({
  base: '/tether/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // we register firebase-messaging-sw.js ourselves; two competing SWs at the same scope breaks push
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'Tether',
        short_name: 'Tether',
        description: 'A quiet check-in for coming back to the present.',
        theme_color: '#14152A',
        background_color: '#14152A',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/tether/',
        scope: '/tether/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
})
