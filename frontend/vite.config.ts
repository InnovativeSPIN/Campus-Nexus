import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8086,
    strictPort: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3005',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('[VITE-PROXY] Error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log(`[VITE-PROXY] Forwarding ${req.method} ${req.url} -> ${options.target}${req.url}`);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log(`[VITE-PROXY] Response from ${req.url}: ${proxyRes.statusCode}`);
          });
        }
      },
      '/uploads': {
        target: 'http://localhost:3005',
        changeOrigin: true,
        secure: false,
      },      // route format files from backend so downloads work in dev
      '/Format': {
        target: 'http://localhost:3005',
        changeOrigin: true,
        secure: false,
      },    },
  },
})
