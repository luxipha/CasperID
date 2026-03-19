import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true, // Allow ngrok and other tunnels
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'credentialless',
      },
      // hmr: {
      //   clientPort: 443, // Ngrok uses 443 for HTTPS
      // },
      proxy: {
        // Proxy API calls to local backend during development
        '/api': {
          target: env.VITE_LOCAL_BACKEND_URL || 'http://127.0.0.1:3001',
          changeOrigin: true,
          secure: false,
        },
        // Proxy well-known endpoints (JWKS, OpenID Connect discovery)
        '/.well-known': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'logos/favicon.ico',
          'logos/apple-touch-icon.png',
          'logos/web-app-manifest-192x192.png',
          'logos/web-app-manifest-512x512.png'
        ],
        manifest: {
          name: 'CasperID',
          short_name: 'CasperID',
          description: 'Verify once, Reuse everywhere. Your decentralized identity hub.',
          theme_color: '#8652E2',
          background_color: '#F8F9FF',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'logos/web-app-manifest-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'logos/web-app-manifest-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: 'logos/web-app-manifest-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'logos/web-app-manifest-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{css,html,ico,png,svg,woff,woff2}'],
          // Exclude large JS files (Barretenberg WASM is 65MB+)
          globIgnores: ['**/assets/index-*.js'],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          maximumFileSizeToCacheInBytes: 100 * 1024 * 1024, // 100MB
          // Only enable runtime caching for JS in production to avoid dev-server ENOENT errors
          runtimeCaching: mode === 'production' ? [
            {
              urlPattern: /\.js$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'js-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                },
              },
            },
          ] : [],
        },
        devOptions: {
          enabled: true,
          type: 'module'
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    build: {
      target: 'esnext',
    },
    esbuild: {
      supported: {
        'top-level-await': true,
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext',
        supported: {
          'top-level-await': true,
        },
      },
      // Exclude Noir/Barretenberg packages from pre-bundling
      // They use dynamic imports and WASM that don't work well with esbuild
      exclude: [
        '@noir-lang/noir_js',
        '@noir-lang/backend_barretenberg',
        '@aztec/bb.js',
      ],
    },
    worker: {
      format: 'es',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'react': path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        'framer-motion': path.resolve(__dirname, 'node_modules/framer-motion'),
      }
    }
  };
});
