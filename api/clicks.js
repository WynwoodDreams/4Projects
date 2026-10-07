// Click heatmap endpoint.
//
//   POST /api/clicks  { events: [...] }            -> 204   (public; called by clicks.js)
//   GET  /api/clicks?view=pages&from=&to=          -> { pages: [...] }
//   GET  /api/clicks?view=points&page=&from=&to=&device=&visitor=
//                                                  -> { points: [...] }
//
// GET requires  Authorization: Bearer <HEATMAP_KEY>  and is used only by the
// private dashboard at /heatmap.html.
//
// Storage is the bb_click_events table in Supabase, reached through its REST
// API with the service role key. The key never leaves this function.
//
// Environment variables (Vercel project settings):
//   SUPABASE_URL               https://<ref>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY  service role key (Project Settings > API)
//   HEATMAP_KEY                any long random string; paste it into the dashboard

import { timingSafeEqual } from 'node:crypto';
import { json, readJsonBody, bearer } from './_premium-auth.js';

const MAX_EVENTS = 50;
const DEVICES = new Set(['mobile', 'tablet', 'desktop']);
const VISITORS = new Set(['new', 'returning']);

const int = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;
const str = (v, max) => typeof v === 'string' && v.length <= max;

function clean(e) {
  if (!e || typeof e !== 'object') return null;
  if (!str(e.page, 200) || !e.page.startsWith('/')) return null;
  if (!int(e.x, -100000, 100000) || !int(e.y, -100000, 1000000)) return null;
  if (!int(e.vw, 1, 20000) || !int(e.vh, 1, 20000)) return null;
  if (!int(e.doc_w, 1, 50000) || !int(e.doc_h, 1, 1000000)) return null;
  if (!DEVICES.has(e.device) || !VISITORS.has(e.visitor)) return null;
  if (!str(e.session_id, 40) || !e.session_id) return null;
  return {
    page: e.page.split('?')[0].split('#')[0],
    x: e.x, y: e.y, vw: e.vw, vh: e.vh, doc_w: e.doc_w, doc_h: e.doc_h,
    target: str(e.target, 80) ? e.target : null,
    device: e.device, visitor: e.visitor, session_id: e.session_id,
    rage: e.rage === true,
  };
}

function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ''), key };
}

async function sb(path, init = {}) {
  const cfg = supabase();
  if (!cfg) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set');
  const res = await fetch(cfg.url + '/rest/v1/' + path, {
    ...init,
    headers: {
      apikey: cfg.key,
      Authorization: 'Bearer ' + cfg.key,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error('Supabase ' + res.status + ': ' + (await res.text()).slice(0, 200));
  return res.status === 204 ? null : res.json();
}

function keyOk(req) {
  const expected = process.env.HEATMAP_KEY || '';
  const given = bearer(req);
  if (!expected || !given) return false;
  const a = Buffer.from(given), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function isoOr(v, fallback) {
  const d = typeof v === 'string' ? new Date(v) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toISOString() : fallback;
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const body = await readJsonBody(req);
    const events = Array.isArray(body.events) ? body.events.slice(0, MAX_EVENTS).map(clean).filter(Boolean) : [];
    if (!events.length) return json(res, 400, { error: 'No valid events.' });
    if (!supabase()) { res.statusCode = 204; return res.end(); } // collector is harmless when unconfigured
    try {
      await sb('bb_click_events', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(events) });
    } catch (e) {
      console.error(e.message);
      return json(res, 502, { error: 'Could not store events.' });
    }
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'GET') return json(res, 405, { error: 'GET or POST only' });
  if (!process.env.HEATMAP_KEY) return json(res, 503, { error: 'HEATMAP_KEY is not set in Vercel.' });
  if (!keyOk(req)) return json(res, 401, { error: 'Bad key.' });
  if (!supabase()) return json(res, 503, { error: 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set in Vercel.' });

  const q = new URL(req.url, 'http://x').searchParams;
  const now = Date.now();
  const from = isoOr(q.get('from'), new Date(now - 7 * 864e5).toISOString());
  const to = isoOr(q.get('to'), new Date(now + 60e3).toISOString());

  try {
    if (q.get('view') === 'pages') {
      const pages = await sb('rpc/bb_click_pages', { method: 'POST', body: JSON.stringify({ p_from: from, p_to: to }) });
      return json(res, 200, { pages, from, to });
    }
    const page = q.get('page') || '/';
    const device = DEVICES.has(q.get('device')) ? q.get('device') : null;
    const visitor = VISITORS.has(q.get('visitor')) ? q.get('visitor') : null;
    const points = await sb('rpc/bb_click_points', {
      method: 'POST',
      body: JSON.stringify({ p_page: page, p_from: from, p_to: to, p_device: device, p_visitor: visitor, p_limit: 20000 }),
    });
    return json(res, 200, { page, from, to, points });
  } catch (e) {
    console.error(e.message);
    return json(res, 502, { error: 'Could not read events.' });
  }
}
