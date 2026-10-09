import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    // three.js lives in lazily-loaded scene chunks (~540 kB min, ~140 kB gzip); the main bundle stays lean.
    chunkSizeWarningLimit: 700,
  },
});
