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

const oembed = (id, isPlaylist) => {
  const target = isPlaylist
    ? `https://www.youtube.com/playlist?list=${id}`
    : `https://www.youtube.com/watch?v=${id}`;
  return `https://www.youtube.com/oembed?url=${encodeURIComponent(target)}&format=json`;
};

// Playlist cards use ytThumb for their still image, so a dead ytThumb leaves a
// blank card even when the playlist itself is fine.
async function checkThumb(p, failures) {
  if (!p.ytThumb) return;
  try {
    const res = await fetch(oembed(p.ytThumb, false));
    if (!res.ok) {
      failures.push(`${p.id}: ytThumb ${p.ytThumb} returned HTTP ${res.status}; card will render without an image.`);
      console.log(`      ⚠ ytThumb ${p.ytThumb} is dead (HTTP ${res.status})`);
    }
  } catch (err) {
    failures.push(`${p.id}: network error checking ytThumb ${p.ytThumb} (${err.message})`);
  }
}

const projects = readIndexProjects();
const failures = [];

console.log(`Checking ${projects.length} videos...\n`);

for (const p of projects) {
  let res;
  try {
    res = await fetch(oembed(p.youtube, p.ytPlaylist));
  } catch (err) {
    failures.push(`${p.id}: network error checking ${p.youtube} (${err.message})`);
    console.log(`ERROR ${p.id} — ${err.message}`);
    continue;
  }

  const kind = p.ytPlaylist ? 'playlist' : 'video';

  if (res.status === 401 || res.status === 403) {
    // oEmbed refuses videos whose owner disabled embedding.
    failures.push(`${p.id}: ${kind} ${p.youtube} exists but embedding is disabled.`);
    console.log(`FAIL  ${p.id} — embedding disabled (${p.youtube})`);
  } else if (res.status === 404) {
    failures.push(`${p.id}: ${kind} ${p.youtube} not found (deleted or private).`);
    console.log(`FAIL  ${p.id} — not found (${p.youtube})`);
  } else if (!res.ok) {
    failures.push(`${p.id}: unexpected status ${res.status} for ${p.youtube}.`);
    console.log(`FAIL  ${p.id} — HTTP ${res.status} (${p.youtube})`);
  } else {
    const { title } = await res.json();
    // Stored titles are editorial for playlists (the real ones are often long
    // and channel-branded), so only flag drift on single videos.
    const drift = !p.ytPlaylist && title.trim() !== (p.ytTitle || '').trim();
    console.log(`OK    ${p.id} — [${kind}] ${title}${drift ? `\n      ⚠ stored title differs: "${p.ytTitle}"` : ''}`);
    await checkThumb(p, failures);
  }
}

if (failures.length) {
  console.error(`\n${failures.length} video(s) need attention:\n` + failures.map(f => `  - ${f}`).join('\n'));
  process.exit(1);
}

console.log('\nAll videos resolved successfully.');
