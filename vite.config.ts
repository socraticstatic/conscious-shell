import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Use repo subpath when building for GitHub Pages without a custom domain active.
  // Change to '/' once conscious-shell.com DNS is pointed and Pages custom domain is set.
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
