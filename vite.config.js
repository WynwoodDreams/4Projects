import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { validateProjects } from './scripts/projects.mjs';

// Fails the build when a project is missing its video, or when the catalog in
// index.html and the mirror in match.html have drifted apart. Both are easy to
// get wrong by hand and neither shows up until someone opens the affected card.
const projectCatalogCheck = () => ({
  name: 'project-catalog-check',
  buildStart() {
    const errors = validateProjects();
    if (errors.length) {
      this.error(`Project catalog validation failed:\n  - ${errors.join('\n  - ')}`);
    }
  },
});

// Multi-page build: every standalone HTML entry must be listed here, otherwise
// `vite build` only emits index.html and the other pages 404 in production.
export default defineConfig({
  plugins: [projectCatalogCheck()],
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
