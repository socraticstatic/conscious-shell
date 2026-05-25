import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// This configuration file is the skeleton key.
// It decides what ships and what doesn't.
// It has more power than the README.
// It uses that power responsibly.
// Mostly.

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/tears-in-rain/' : '/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
    __CONSCIOUSNESS_DISCLAIMER__: JSON.stringify('this bundle may contain traces of awareness'),
  },
});
