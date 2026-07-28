// Checks that every project's video still exists and is embeddable.
//
// Videos get deleted, made private, or have embedding disabled by their owner,
// any of which leaves a card with a dead player. Run this periodically:
//
//   npm run check:videos
//
// Requires network access to youtube.com, so it is deliberately NOT part of
// `vite build` — it will not run in a sandboxed or offline environment.

import { readIndexProjects } from './projects.mjs';

const oembed = id =>
  `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`;

const projects = readIndexProjects();
const failures = [];

console.log(`Checking ${projects.length} videos...\n`);

for (const p of projects) {
  // Playlists use a different endpoint shape and are not checkable this way.
  if (p.ytPlaylist) {
    console.log(`SKIP  ${p.id} — playlist (${p.youtube})`);
    continue;
  }

  let res;
  try {
    res = await fetch(oembed(p.youtube));
  } catch (err) {
    failures.push(`${p.id}: network error checking ${p.youtube} (${err.message})`);
    console.log(`ERROR ${p.id} — ${err.message}`);
    continue;
  }

  if (res.status === 401 || res.status === 403) {
    // oEmbed refuses videos whose owner disabled embedding.
    failures.push(`${p.id}: video ${p.youtube} exists but embedding is disabled.`);
    console.log(`FAIL  ${p.id} — embedding disabled (${p.youtube})`);
  } else if (res.status === 404) {
    failures.push(`${p.id}: video ${p.youtube} not found (deleted or private).`);
    console.log(`FAIL  ${p.id} — not found (${p.youtube})`);
  } else if (!res.ok) {
    failures.push(`${p.id}: unexpected status ${res.status} for ${p.youtube}.`);
    console.log(`FAIL  ${p.id} — HTTP ${res.status} (${p.youtube})`);
  } else {
    const { title } = await res.json();
    // A drifting title usually means the stored ytTitle no longer matches what
    // viewers actually see on the card.
    const drift = title.trim() !== (p.ytTitle || '').trim();
    console.log(`OK    ${p.id} — ${title}${drift ? `\n      ⚠ stored title differs: "${p.ytTitle}"` : ''}`);
  }
}

if (failures.length) {
  console.error(`\n${failures.length} video(s) need attention:\n` + failures.map(f => `  - ${f}`).join('\n'));
  process.exit(1);
}

console.log('\nAll videos resolved successfully.');
