import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
      proxy: {
        '/keyrock': {
          target: 'http://localhost:7000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/keyrock/, ''),
        },
        '/v1': {
          target: 'http://localhost:7000',
          changeOrigin: true,
          secure: false,
        },
        '/v2': {
          target: 'http://localhost:1026',
          changeOrigin: true,
          secure: false,
        },
        '/idm': {
          target: 'http://localhost:7000',
          changeOrigin: true,
          secure: false,
        },
        '/auth': {
          target: 'http://localhost:7000',
          changeOrigin: true,
          secure: false,
        },
        '/quantumleap': {
          target: 'http://localhost:8668',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/quantumleap/, ''),
        },
      },
  }
})
