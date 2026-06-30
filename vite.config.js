import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

// Multi-page build: every standalone HTML entry must be listed here, otherwise
// `vite build` only emits index.html and the other pages 404 in production.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        certifications: fileURLToPath(new URL('./certifications.html', import.meta.url)),
      },
    },
  },
});
