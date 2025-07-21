import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  root: './',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          animations: ['framer-motion', 'gsap'],
          ui: ['lucide-react', 'react-hot-toast']
        }
      }
    }
  },
  define: {
    // Add a global process variable for compatibility with Node.js modules
    'process.env': {}, 
    'process.platform': JSON.stringify('browser'),
    'process.version': JSON.stringify(''),
    'process': {
      env: {}
    }
  }
});