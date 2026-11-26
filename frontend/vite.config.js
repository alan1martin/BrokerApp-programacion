import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ], 
  // Asegura que las rutas del index.html, los logos y assets sean relativas y no se rompan en el subdominio
  base: './', 
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'localhost+2-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'localhost+2.pem')),
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000', 
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    // Optimización para el Nginx de la academia
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  }
})