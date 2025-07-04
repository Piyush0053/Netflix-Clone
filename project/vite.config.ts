import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  root: './',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
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