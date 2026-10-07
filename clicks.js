// Click collector for the heatmap dashboard (/heatmap.html).
//
// Records where visitors click on each page and ships the points to
// /api/clicks in small batches. Nothing identifying is stored: no IP, no
// user agent, no cookies. A random per-tab session id groups clicks into
// sessions and a localStorage flag tells new from returning visitors.
//
// Coordinates are document pixels (page scroll included) plus the document
// and viewport size at the time, so the dashboard can scale them onto a
// preview of the page rendered at a different width.

const ENDPOINT = '/api/clicks';
const FLUSH_MS = 4000;
const MAX_BATCH = 50;
const RAGE_WINDOW_MS = 1000;
const RAGE_RADIUS = 30;
const RAGE_COUNT = 3;

const sessionId = (() => {
  try {
    const k = 'bb_hm_session';
    let v = sessionStorage.getItem(k);
    if (!v) { v = Math.random().toString(36).slice(2, 12) + Date.now().toString(36); sessionStorage.setItem(k, v); }
    return v;
  } catch { return 'anon' + Date.now().toString(36); }
})();

const visitor = (() => {
  try {
    const k = 'bb_hm_seen';
    if (localStorage.getItem(k)) return 'returning';
    localStorage.setItem(k, '1');
    return 'new';
  } catch { return 'new'; }
})();

const device = () => {
  const w = window.innerWidth;
  return w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
};

// Short, non-identifying label for what was clicked: tag plus id/class or
// trimmed text of the nearest control.
function describe(el) {
  const ctl = el.closest('a, button, input, select, textarea, label, summary, [role="button"]') || el;
  const tag = ctl.tagName.toLowerCase();
  let hint = '';
  if (ctl.id) hint = '#' + ctl.id;
  else if (ctl.getAttribute('aria-label')) hint = ctl.getAttribute('aria-label');
  else if (ctl.classList.length) hint = '.' + ctl.classList[0];
  const text = (ctl.innerText || ctl.value || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  return (tag + ' ' + hint + (text ? ' "' + text + '"' : '')).trim().slice(0, 80);
}

let queue = [];
let timer = null;
let recent = [];

function send(useBeacon) {
  if (!queue.length) return;
  const body = JSON.stringify({ events: queue.splice(0, MAX_BATCH) });
  if (useBeacon && navigator.sendBeacon) {
    navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
  } else {
    fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
  }
  if (queue.length) send(useBeacon);
}

function schedule() {
  if (timer) return;
  timer = setTimeout(() => { timer = null; send(false); }, FLUSH_MS);
}

// Inside the dashboard's preview frame nothing is recorded.
const framed = window.self !== window.top;

if (!framed) document.addEventListener('click', (e) => {
  if (!(e.target instanceof Element)) return;
  const now = Date.now();
  const x = Math.round(e.pageX);
  const y = Math.round(e.pageY);

  recent = recent.filter(r => now - r.t < RAGE_WINDOW_MS);
  recent.push({ t: now, x, y });
  const rage = recent.filter(r => Math.hypot(r.x - x, r.y - y) <= RAGE_RADIUS).length >= RAGE_COUNT;

  const doc = document.documentElement;
  queue.push({
    page: location.pathname,
    x, y,
    vw: window.innerWidth,
    vh: window.innerHeight,
    doc_w: doc.scrollWidth,
    doc_h: doc.scrollHeight,
    target: describe(e.target),
    device: device(),
    visitor,
    session_id: sessionId,
    rage,
  });
  if (queue.length >= MAX_BATCH) send(false); else schedule();
}, { passive: true, capture: true });

addEventListener('pagehide', () => send(true));
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') send(true); });
