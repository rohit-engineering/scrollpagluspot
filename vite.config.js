import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import compression from 'vite-plugin-compression'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),

    // ✅ GZIP + Brotli Compression for maximum size reduction
    compression({ algorithm: 'gzip', ext: '.gz', threshold: 1024 }),
    compression({ algorithm: 'brotliCompress', ext: '.br', threshold: 1024 }),

    // ✅ Progressive Web App (PWA) - improves perceived speed
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'My Vue + Supabase App',
        short_name: 'VueApp',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#42b883',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            // Cache Supabase & API calls for short duration
            urlPattern: /^https:\/\/[a-z0-9.-]+\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 10 } // 10 mins
            }
          },
          {
            // Cache images and static assets
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 } // 7 days
            }
          }
        ]
      }
    }),

    // ✅ Bundle size visualizer (optional - run after build)
    visualizer({ filename: 'dist/stats.html', open: false })
  ],

  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    terserOptions: {
      compress: {
        drop_console: true,   // remove console.log
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        // Split vendor chunks for faster caching
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString()
          }
        }
      }
    }
  },

  server: {
    port: 5173,
    open: true,
    headers: {
      // Cache static files aggressively
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },

  preview: {
    port: 8080,
    open: true
  }
}))
