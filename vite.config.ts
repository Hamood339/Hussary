import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'Hussary Quran',
        short_name: 'Hussary Quran',
        description: "Écoutez la récitation du Cheikh Mahmoud Khalil Al-Hussary, hors ligne, sur un lecteur premium.",
        lang: 'fr',
        theme_color: '#064e3b',
        background_color: '#052e22',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Les données du Mushaf (604 JSON + ~606 polices) sont trop nombreuses
        // pour le précache : elles passent par runtimeCaching ci-dessous.
        globIgnores: ['**/quran/**'],
        cleanupOutdatedCaches: true,
        // Une requête /audio/* ou /quran/* ne doit jamais renvoyer index.html.
        navigateFallbackDenylist: [/^\/audio\//, /^\/quran\//],
        runtimeCaching: [
          {
            urlPattern: /\/audio\/.*\.mp3$/i,
            handler: 'CacheFirst',
            options: {
              // "-v2" : l'ancien cache a pu stocker des réponses 206 partielles
              // (fichiers tronqués -> la lecture se coupe en plein milieu).
              // Nouveau nom = on repart d'un cache propre chez tous les users.
              cacheName: 'quran-audio-cache-v2',
              rangeRequests: true,
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                // 200 uniquement : on ne met en cache que des fichiers complets.
                // 206 (fragment Range) et 0 (réponse opaque) sont exclus pour
                // ne jamais enregistrer un audio partiel comme s'il etait entier.
                statuses: [200],
              },
            },
          },
          {
            // Texte du Mushaf + polices QCF v2 : léger, mis en cache à la lecture.
            urlPattern: /\/quran\/.*\.(?:json|woff2)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'quran-mushaf-cache',
              expiration: { maxEntries: 1400, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [200] },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'quran-image-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
