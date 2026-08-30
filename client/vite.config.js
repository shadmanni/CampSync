import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      // Socket.io needs the websocket upgrade proxied too, or live
      // seat-counts / bid updates silently fall back to nothing in dev.
      '/socket.io': { target: 'http://localhost:5000', ws: true, changeOrigin: true }
    }
  }
});
