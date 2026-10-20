// POST /api/suggest  { title, path, level, stack, video, why, name, email }
//
// Takes a project suggestion from the form on the home page and forwards it to
// SUGGEST_WEBHOOK_URL (Vercel → Settings → Environment Variables). The body is
// shaped so a Slack or Discord incoming webhook renders it as a message and a
// generic endpoint (Zapier, Make, a Google Apps Script) gets the fields too.
//
// Without the variable the endpoint answers 503 and the page falls back to a
// pre-filled email, so nothing is lost while it is unconfigured.

import { json, readJsonBody } from './_premium-auth.js';

const PATHS = ['ai', 'cloud', 'cs', 'cyber', 'data', 'helpdesk', 'swe', 'tech-it'];
const LEVELS = ['beginner', 'intermediate', 'advanced', 'unsure'];
const LIMITS = { title: 120, path: 20, level: 20, stack: 300, video: 300, why: 1500, name: 80, email: 120 };

const clean = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'POST only' });

  const webhook = process.env.SUGGEST_WEBHOOK_URL;
  if (!webhook) return json(res, 503, { error: 'Suggestions are not configured yet. Set SUGGEST_WEBHOOK_URL in Vercel.', configured: false });

  const body = await readJsonBody(req);

  // Bots fill every field; people never see this one.
  if (body.website) return json(res, 200, { ok: true });

  const s = {};
  for (const [k, max] of Object.entries(LIMITS)) s[k] = clean(body[k], max);

  if (!s.title || !s.stack || !s.why) return json(res, 400, { error: 'Title, tech stack, and why it matters are required.' });
  if (!PATHS.includes(s.path)) return json(res, 400, { error: 'Pick a career path.' });
  if (!LEVELS.includes(s.level)) s.level = 'unsure';
  if (s.video && !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(s.video)) {
    return json(res, 400, { error: 'The video link should be a YouTube URL.' });
  }
  if (s.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)) return json(res, 400, { error: 'That email does not look right.' });

  const lines = [
    `*New project suggestion: ${s.title}*`,
    `Path: ${s.path} · Level: ${s.level}`,
    `Stack: ${s.stack}`,
    s.video ? `Video: ${s.video}` : 'Video: (none given)',
    `Why now: ${s.why}`,
    `From: ${s.name || 'anonymous'}${s.email ? ` <${s.email}>` : ''}`,
  ];
  const text = lines.join('\n');

  let upstream;
  try {
    upstream = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // text → Slack, content → Discord, the rest → anything that reads JSON.
      body: JSON.stringify({ text, content: text.slice(0, 1900), suggestion: s, submittedAt: new Date().toISOString() }),
    });
  } catch {
    return json(res, 502, { error: 'Could not reach the suggestion inbox. Try again in a minute.' });
  }
  if (!upstream.ok) return json(res, 502, { error: `The suggestion inbox answered ${upstream.status}.` });
  return json(res, 200, { ok: true });
}
