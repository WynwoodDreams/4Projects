// The agent reads the same catalog the projects page shows: the PROJECTS array inside the
// committed index.html, which is the only record of what is live. Vercel bundles index.html
// next to the function through `includeFiles` in vercel.json. If that file cannot be read or
// parsed, a small, clearly labelled sample set stands in so the page still works; every
// response says which one it is using.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_PATH = path.join(HERE, 'sample-projects.json');
const MARKER = 'const PROJECTS = ';

export const PATHS = {
  ai: 'AI Engineer', cloud: 'Cloud', cs: 'Computer Science', cyber: 'Cybersecurity',
  data: 'Data Analyst', helpdesk: 'Help Desk', swe: 'Software Engineer', 'tech-it': 'IT Support',
};
export const LEVELS = ['beginner', 'intermediate', 'advanced'];

// "1 to 2 hours", "30 minutes", "2 to 3 hours plus the soak" -> [min, max] in hours.
export function parseHours(text) {
  const t = String(text || '').toLowerCase();
  const m = /(\d+(?:\.\d+)?)(?:\s*(?:to|-|–)\s*(\d+(?:\.\d+)?))?\s*(hour|hr|minute|min|day)/.exec(t);
  if (!m) return null;
  let lo = parseFloat(m[1]), hi = m[2] ? parseFloat(m[2]) : lo;
  if (/^min/.test(m[3])) { lo /= 60; hi /= 60; }
  if (/^day/.test(m[3])) { lo *= 6; hi *= 6; }
  return [lo, hi];
}

function hoursText(lo, hi) {
  const r = n => (n < 10 ? Math.round(n * 2) / 2 : Math.round(n));
  return lo === hi ? `about ${r(lo)} hours` : `${r(lo)} to ${r(hi)} hours`;
}

function normalise(raw, i) {
  const d = {};
  d.id = String(raw.id || i).replace(/[^\w-]/g, '');
  d.path = PATHS[raw.path] ? raw.path : 'swe';
  d.pathName = PATHS[d.path];
  d.level = LEVELS.includes(raw.level) ? raw.level : 'intermediate';
  d.title = String(raw.title || 'Untitled project');
  d.summary = String(raw.summary || '');
  d.tech = (Array.isArray(raw.tech) ? raw.tech : []).map(t => String(t)).filter(Boolean);
  // The catalog writes skills as one comma-separated string; the ranking step names gaps as
  // indexes into this list, so the split has to be the same everywhere.
  d.skills = String(raw.skills || '').split(',').map(s => s.trim()).filter(Boolean).map((text, idx) => ({ i: idx, text }));
  d.pitch = String(raw.why || '');
  d.useCase = String(raw.useCase || '');
  d.steps = (Array.isArray(raw.steps) ? raw.steps : []).map(s => ({ title: String((s && s.title) || ''), time: String((s && s.time) || '') }));
  let lo = 0, hi = 0, known = 0;
  for (const s of d.steps) { const h = parseHours(s.time); if (h) { lo += h[0]; hi += h[1]; known++; } }
  d.hours = known ? { min: Math.round(lo), max: Math.round(hi), text: hoursText(lo, hi) } : null;
  d.video = raw.ytTitle ? String(raw.ytTitle) : '';
  d.hay = [d.title, d.pathName, d.path, d.level, d.summary, d.tech.join(' '), d.skills.map(s => s.text).join(' '), d.pitch, d.useCase, d.steps.map(s => s.title).join(' ')].join(' ').toLowerCase();
  return d;
}

// index.html stores JS object literals (unquoted keys, single quotes), so the array source is
// evaluated the way scripts/projects.mjs does at build time, never parsed as JSON.
export function parseCatalog(html) {
  const start = html.indexOf(MARKER + '[');
  if (start === -1) throw new Error('index.html: PROJECTS array not found');
  const end = html.indexOf('\n  ];', start);
  if (end === -1) throw new Error('index.html: end of PROJECTS array not found');
  const list = new Function(`return ${html.slice(start + MARKER.length, end + 4)}`)();
  if (!Array.isArray(list) || !list.length) throw new Error('the catalog is empty');
  const updated = (/<meta name="catalog-updated" content="(\d{4}-\d{2}-\d{2})"/.exec(html) || [])[1] || '';
  return { projects: list.map(normalise), updated };
}

let cache = null;
export function loadCatalog(opts = {}) {
  if (cache && !opts.fresh) return cache;
  // A path given outright (an option, or ASSISTANT_CATALOG_PATH) is the only one tried, so a
  // test or a deploy that points at a missing file lands on the sample set rather than on
  // whatever index.html happens to be nearby.
  const given = opts.catalogPath || process.env.ASSISTANT_CATALOG_PATH;
  const candidates = given ? [given] : [path.join(process.cwd(), 'index.html'), path.join(HERE, '..', '..', 'index.html')];
  for (const p of candidates) {
    try {
      const html = fs.readFileSync(p, 'utf8');
      const { projects, updated } = parseCatalog(html);
      let when = updated;
      if (!when) { try { when = fs.statSync(p).mtime.toISOString().slice(0, 10); } catch (e) { /* unknown */ } }
      cache = { source: 'catalog', projects, updated: when, path: p };
      return cache;
    } catch (e) { /* try the next */ }
  }
  const sample = JSON.parse(fs.readFileSync(SAMPLE_PATH, 'utf8'));
  cache = { source: 'sample', projects: sample.projects.map(normalise), updated: sample.updated, path: SAMPLE_PATH };
  return cache;
}

// What the page renders: only fields the catalog itself carries, never model output. The
// link is the site's own deep link, so a reply cannot change where a card goes.
export function publicProject(d) {
  return {
    id: d.id, path: d.path, pathName: d.pathName, level: d.level, title: d.title, summary: d.summary,
    tech: d.tech, skills: d.skills.map(s => s.text), hours: d.hours, steps: d.steps.length, video: d.video,
    url: '/#project=' + encodeURIComponent(d.id),
    // Every card says so: the project is from this site's catalog and the fit was AI-picked.
    source: 'catalog',
  };
}
