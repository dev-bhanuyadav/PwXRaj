import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api-v1': {
        target: 'https://api.pimaxer.in',
        changeOrigin: true,
        headers: {
          'Referer': 'https://www.pw.live/',
          'Origin': 'https://www.pw.live'
        },
        rewrite: (path) => path.replace(/^\/api-v1/, '')
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('shaka-player')) return 'shaka';
            if (id.includes('hls.js')) return 'hls';
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor';
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})
