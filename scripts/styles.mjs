// Guards against silent stylesheet drift.
//
// index.html does not load styles.css — it carries its own inline
// <style id="glass-terminal-style"> block. styles.css serves the other three
// pages. The two overlap heavily, so editing the wrong copy changes nothing
// visible and reports no error anywhere. This compares them and fails the build
// when a shared selector's declarations diverge.

import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const resolve = name => fileURLToPath(new URL(`../${name}`, import.meta.url));

// Selectors that are deliberately different per page. Each needs a reason —
// if you cannot write one, it is drift, not an override.
const INTENTIONAL_OVERRIDES = {
  '.footer-grid': 'index.html has a four-column footer; the other pages have three.',
  '.header-actions': 'index.html spaces its actions differently around the search field.',
  '.header-actions .stat-pill': 'Stat pills are index-only; the other pages hide them.',
  '.card-footer': 'index.html right-aligns; catalog pages space-between.',
};

const declarations = css => {
  const map = new Map();
  // Flat rules only — nested at-rule bodies are skipped, which is fine because
  // the goal is catching drift in the shared component styles.
  for (const m of css.matchAll(/(?:^|\})\s*([.#][^{}\n]*?)\s*\{([^{}]*)\}/g)) {
    const selector = m[1].trim();
    if (!map.has(selector)) map.set(selector, m[2].split(/\s+/).join(' ').trim());
  }
  return map;
};

export function readInlineStyles() {
  const src = readFileSync(resolve('index.html'), 'utf8');
  const open = '<style id="glass-terminal-style">';
  const start = src.indexOf(open);
  if (start === -1) throw new Error('index.html: inline style block not found');
  const end = src.indexOf('</style>', start);
  return src.slice(start + open.length, end);
}

export function validateStyles() {
  const inline = declarations(readInlineStyles());
  const shared = declarations(readFileSync(resolve('styles.css'), 'utf8'));

  const drifted = [];
  for (const [selector, body] of shared) {
    if (!inline.has(selector)) continue;
    if (inline.get(selector) === body) continue;
    if (selector in INTENTIONAL_OVERRIDES) continue;
    drifted.push(selector);
  }

  if (!drifted.length) return [];
  return [
    `${drifted.length} selector(s) differ between the inline styles in index.html and styles.css:\n` +
    drifted.map(s => `      ${s}`).join('\n') +
    '\n    Update both copies, or add the selector to INTENTIONAL_OVERRIDES in scripts/styles.mjs with a reason.',
  ];
}
