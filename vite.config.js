import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { validateProjects } from './scripts/projects.mjs';
import { validateStyles } from './scripts/styles.mjs';

// This project keeps two things duplicated by hand — the project catalog
// (index.html + match.html) and the stylesheet (an inline block in index.html +
// styles.css). Both fail silently when only one copy is edited, so both are
// checked at build time.
const consistencyCheck = () => ({
  name: 'consistency-check',
  buildStart() {
    const errors = [...validateProjects(), ...validateStyles()];
    if (errors.length) {
      this.error(`Consistency check failed:\n  - ${errors.join('\n  - ')}`);
    }
  },
});

// Multi-page build: every standalone HTML entry must be listed here, otherwise
// `vite build` only emits index.html and the other pages 404 in production.
export default defineConfig({
  plugins: [consistencyCheck()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        certifications: fileURLToPath(new URL('./certifications.html', import.meta.url)),
        prompts: fileURLToPath(new URL('./prompts.html', import.meta.url)),
        match: fileURLToPath(new URL('./match.html', import.meta.url)),
      },
    },
  },
});
