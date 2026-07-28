// Shared extraction for the PROJECTS catalog.
//
// The catalog lives twice: the full entries in index.html, and a trimmed mirror
// in match.html that the job matcher reads. Nothing keeps them in sync at
// runtime, so both are parsed here and checked against each other at build time.

import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const MARKER = 'const PROJECTS = ';

const resolve = name => fileURLToPath(new URL(`../${name}`, import.meta.url));

// index.html stores JS object literals (unquoted keys, single quotes), so the
// array source is evaluated rather than parsed as JSON. `new Function` is used
// instead of a direct eval so bundlers can still statically analyse this module.
export function readIndexProjects() {
  const src = readFileSync(resolve('index.html'), 'utf8');
  const start = src.indexOf(MARKER + '[');
  if (start === -1) throw new Error('index.html: PROJECTS array not found');
  const end = src.indexOf('\n  ];', start);
  if (end === -1) throw new Error('index.html: end of PROJECTS array not found');
  return new Function(`return ${src.slice(start + MARKER.length, end + 4)}`)();
}

// match.html stores the mirror as a single JSON literal.
export function readMatchProjects() {
  const src = readFileSync(resolve('match.html'), 'utf8');
  const start = src.indexOf(MARKER + '[');
  if (start === -1) throw new Error('match.html: PROJECTS array not found');
  const end = src.indexOf('];', start);
  if (end === -1) throw new Error('match.html: end of PROJECTS array not found');
  return JSON.parse(src.slice(start + MARKER.length, end + 1));
}

// Returns a list of human-readable problems; empty means the catalog is sound.
export function validateProjects() {
  const errors = [];
  const projects = readIndexProjects();

  const seen = new Set();
  for (const p of projects) {
    const where = `project "${p.id || '(missing id)'}"`;
    if (!p.id) errors.push('A project is missing an id.');
    else if (seen.has(p.id)) errors.push(`Duplicate id: ${p.id}`);
    else seen.add(p.id);

    // Every card ships with a video — that is the point of the catalog, so a
    // missing one is a build failure rather than a card that quietly renders
    // without its video block.
    if (!p.youtube) errors.push(`${where} has no youtube id.`);
    if (!p.ytTitle) errors.push(`${where} has no ytTitle.`);

    // Playlist and video ids are not interchangeable: they use different embed
    // urls, and only video ids have a thumbnail endpoint. Mixing them up
    // produces a card that looks fine in source and breaks in the browser.
    // Video ids are always exactly 11 characters; playlist ids carry a known
    // prefix and are longer. Length has to be checked first, because plenty of
    // valid video ids happen to start with a playlist prefix (e.g. "OLXkGB7krGo").
    if (p.youtube) {
      const isVideoId = p.youtube.length === 11;
      const isPlaylistId = p.youtube.length > 11 && /^(PL|UU|OL|FL|RD)/.test(p.youtube);
      if (p.ytPlaylist && !isPlaylistId) {
        errors.push(`${where} is marked ytPlaylist but "${p.youtube}" is not a playlist id.`);
      }
      if (!p.ytPlaylist && !isVideoId) {
        errors.push(`${where} has a malformed video id: "${p.youtube}".` +
          (isPlaylistId ? ' It looks like a playlist id — add ytPlaylist: true.' : ''));
      }
    }
    // Optional, but if present it must be a video id — it is used as the
    // playlist card's thumbnail.
    if (p.ytThumb && p.ytThumb.length !== 11) {
      errors.push(`${where} has a malformed ytThumb: "${p.ytThumb}".`);
    }
    if (p.ytThumb && !p.ytPlaylist) {
      errors.push(`${where} sets ytThumb but is not a playlist; the video id is used directly.`);
    }

    if (!p.path) errors.push(`${where} has no path.`);
    if (!p.level) errors.push(`${where} has no level.`);
    if (!Array.isArray(p.steps) || p.steps.length === 0) {
      errors.push(`${where} has no build steps.`);
    }
  }

  const mirror = readMatchProjects();
  const indexIds = projects.map(p => p.id).join(',');
  const mirrorIds = mirror.map(p => p.id).join(',');
  if (indexIds !== mirrorIds) {
    const missing = projects.filter(p => !mirror.some(m => m.id === p.id)).map(p => p.id);
    const extra = mirror.filter(m => !projects.some(p => p.id === m.id)).map(m => m.id);
    errors.push(
      'index.html and match.html are out of sync.' +
      (missing.length ? ` Missing from match.html: ${missing.join(', ')}.` : '') +
      (extra.length ? ` Only in match.html: ${extra.join(', ')}.` : '') +
      (!missing.length && !extra.length ? ' Same ids, different order.' : '')
    );
  }

  return errors;
}
