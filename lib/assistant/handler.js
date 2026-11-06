// The request handler behind /api/assistant. One POST per visitor turn:
//   { messages: [{role, content, kind?}], recommendedIds: [], visitor: {name, email} }
// and back comes one of
//   { kind: 'question', question }            a follow-up (at most maxFollowups per conversation)
//   { kind: 'results', summary, matches, ... } up to five projects from the catalog, with why and the gaps
//   { kind: 'nomatch', summary, adjustments, closest }
//   { kind: 'answer', reply }                  a question about the recommended projects, answered from their text
//   { kind: 'reply', reply }                   anything else, including the off-topic refusal
// Every reply carries `source` ('catalog' or 'sample'), `model` and `updated`. GET returns the
// same status block so the page can show a paused or sample-data state before anyone types.
import { loadCatalog, publicProject, PATHS } from './catalog.js';
import { retrieve, inferPaths, STRONG, STOP } from './retrieve.js';
import { createClient, configFromEnv, ModelError } from './model.js';
import * as prompts from './prompts.js';
import { createVisitorStore } from './visitors.js';

export const NAME = 'Scout';

export const LIMITS = {
  maxMessages: 16,         // turns kept from the conversation (older ones are dropped client-side too)
  maxMessageChars: 1500,
  maxTotalChars: 9000,
  maxBodyBytes: 32 * 1024,
  maxFollowups: 3,
  maxMatches: 5,
  candidates: 12,
  perMinute: 8,            // per client address, per function instance
  perHour: 40,
  perDay: parseInt(process.env.ASSISTANT_DAILY_CAP, 10) || 400,  // per function instance, all visitors
};

// In-memory, per instance: on serverless this is a soft limit that resets when the instance
// does, which is still enough to stop a loop or a script from draining the gateway. A hard
// shared limit would need a store (KV, Upstash); the hook for it is `limiter` below.
export function memoryLimiter(now = Date.now) {
  const byIp = new Map(); let day = { start: now(), n: 0 };
  return {
    check(ip) {
      const t = now();
      if (t - day.start > 86400000) day = { start: t, n: 0 };
      if (day.n >= LIMITS.perDay) return { ok: false, retryAfter: 3600, reason: 'daily' };
      const rec = byIp.get(ip) || { minute: [], hour: [] };
      rec.minute = rec.minute.filter(x => t - x < 60000); rec.hour = rec.hour.filter(x => t - x < 3600000);
      if (rec.minute.length >= LIMITS.perMinute) return { ok: false, retryAfter: 60, reason: 'minute' };
      if (rec.hour.length >= LIMITS.perHour) return { ok: false, retryAfter: 600, reason: 'hour' };
      rec.minute.push(t); rec.hour.push(t); byIp.set(ip, rec); day.n++;
      if (byIp.size > 5000) byIp.clear();
      return { ok: true };
    },
  };
}

function clientIp(req) {
  const h = req.headers || {};
  const xf = h['x-forwarded-for'] || h['X-Forwarded-For'];
  return String((Array.isArray(xf) ? xf[0] : xf) || h['x-real-ip'] || (req.socket && req.socket.remoteAddress) || 'unknown').split(',')[0].trim();
}

export class HttpError extends Error { constructor(status, message, code = 'bad_request') { super(message); this.status = status; this.code = code; } }

function readBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body !== undefined) { // Vercel parses JSON bodies; a raw string or object both land here
      if (typeof req.body === 'string') { try { resolve(JSON.parse(req.body)); } catch (e) { reject(new HttpError(400, 'The request body is not JSON.')); } }
      else resolve(req.body || {});
      return;
    }
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > LIMITS.maxBodyBytes) { reject(new HttpError(413, 'The request is too large.')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch (e) { reject(new HttpError(400, 'The request body is not JSON.')); } });
    req.on('error', reject);
  });
}

export function cleanMessages(raw) {
  if (!Array.isArray(raw) || !raw.length) throw new HttpError(400, 'Send at least one message.');
  const msgs = raw.slice(-LIMITS.maxMessages).map(m => {
    const role = m && m.role === 'assistant' ? 'assistant' : 'user';
    const content = String((m && m.content) || '').replace(/\s+/g, ' ').trim();
    const kind = m && typeof m.kind === 'string' ? m.kind.slice(0, 20) : '';
    return { role, content, kind };
  }).filter(m => m.content);
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') throw new HttpError(400, 'The last message must be from the visitor.');
  for (const m of msgs) if (m.content.length > LIMITS.maxMessageChars) throw new HttpError(400, `Keep each message under ${LIMITS.maxMessageChars} characters.`, 'too_long');
  if (msgs.reduce((n, m) => n + m.content.length, 0) > LIMITS.maxTotalChars) throw new HttpError(400, 'The conversation is too long; start a new one.', 'too_long');
  return msgs;
}

// The beta asks for a name and an email before the chat opens. The server checks them on
// every turn so the page's form cannot be skipped, and writes one line per conversation to
// the function log and, when Supabase is configured, a row to the visitors table.
// ASSISTANT_GATE=off turns the requirement off without a code change.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function cleanVisitor(v) {
  v = v && typeof v === 'object' ? v : {};
  const name = String(v.name || '').trim().replace(/\s+/g, ' ').slice(0, 80);
  const email = String(v.email || '').trim().toLowerCase().slice(0, 120);
  if (name.length < 2) throw new HttpError(400, `Enter your name to talk to ${NAME}.`, 'who');
  if (!EMAIL.test(email)) throw new HttpError(400, `Enter a valid email address to talk to ${NAME}.`, 'who');
  return { name, email };
}

export function createHandler(options = {}) {
  const env = options.env || process.env;
  const cfg = Object.assign(configFromEnv(env), options.config || {});
  const log = options.log || ((...a) => { if (env.ASSISTANT_DEBUG) console.log('[assistant]', ...a); });
  // Always on: a model failure no longer reaches the visitor, so it has to reach the logs.
  const warn = options.warn || ((...a) => console.warn('[assistant]', ...a));
  const client = createClient(cfg, { fetch: options.fetch, log });
  const limiter = options.limiter || memoryLimiter(options.now);
  const catalogPath = options.catalogPath;
  const gate = String(env.ASSISTANT_GATE || 'on').toLowerCase() !== 'off';
  const visitors = options.visitors || createVisitorStore(env, { fetch: options.storeFetch || globalThis.fetch, warn });

  const status = () => {
    const data = loadCatalog({ catalogPath });
    return { name: NAME, enabled: cfg.enabled && !!cfg.apiKey, configured: !!cfg.apiKey, paused: !cfg.enabled, gate, visitorStore: visitors.enabled, model: cfg.model, providers: cfg.providers,
      source: data.source, projects: data.projects.length, updated: data.updated, paths: PATHS, limits: { maxMessageChars: LIMITS.maxMessageChars, maxFollowups: LIMITS.maxFollowups, maxMatches: LIMITS.maxMatches } };
  };

  // The sign-in insert runs alongside the model calls rather than before them, so a slow
  // database never adds to the visitor's wait; it is awaited before the reply goes out
  // (a serverless function may be frozen the moment it returns).
  async function run(body) {
    const pending = [];
    try { return await answer(body, p => pending.push(p)); }
    finally { await Promise.all(pending); }
  }

  async function answer(body, track) {
    const st = status();
    if (!cfg.enabled) throw new HttpError(503, `${NAME} is paused for now. The projects page and Career Match still work.`, 'paused');
    if (!cfg.apiKey) throw new HttpError(503, `${NAME} is not configured on this deployment (AI_GATEWAY_API_KEY is missing).`, 'not_configured');
    const visitor = gate ? cleanVisitor(body.visitor) : null;
    const messages = cleanMessages(body.messages);
    // One line per conversation, not per turn: the first user message is the sign-in.
    if (visitor && messages.filter(m => m.role === 'user').length === 1) {
      const entry = { name: visitor.name, email: visitor.email, at: new Date().toISOString(), asked: messages[messages.length - 1].content.slice(0, 120) };
      console.log('[assistant] visitor', JSON.stringify(entry));
      track(visitors.record(entry));
    }
    const data = loadCatalog({ catalogPath });
    const byId = new Map(data.projects.map(d => [d.id, d]));
    const recommended = (Array.isArray(body.recommendedIds) ? body.recommendedIds : []).map(id => byId.get(String(id))).filter(Boolean).slice(0, LIMITS.maxMatches);
    const questionsAsked = messages.filter(m => m.role === 'assistant' && m.kind === 'question').length;
    const base = { name: NAME, source: st.source, model: cfg.model, updated: st.updated, projects: st.projects };

    // 1. read the conversation. If the model cannot (empty reply, timeout, bad JSON, no
    // credit), read the visitor's own words instead and search the catalog on those: a
    // student who asked for projects gets projects, not an error about the model.
    let read, fallback = false;
    try {
      read = (await client.complete(prompts.readMessages(messages, { recommended, questionsAsked, maxFollowups: LIMITS.maxFollowups }), { schema: prompts.READ_SCHEMA, schemaName: 'intake', maxTokens: 700 })).json || {};
    } catch (e) {
      if (!(e instanceof ModelError)) throw e;
      warn('intake failed, searching on the visitor\'s words:', e.code, e.detail || '');
      read = keywordRead(messages); fallback = true;
    }
    const profile = normaliseProfile(read.profile);
    log('read', { intent: read.intent, profile, followUp: read.followUp });

    if (read.intent === 'question' && recommended.length) {
      let reply = '';
      try { reply = String((await client.complete(prompts.answerMessages(messages, recommended), { allowPlain: true, temperature: 0.3, maxTokens: 900 })).text || '').trim(); }
      catch (e) { if (!(e instanceof ModelError)) throw e; warn('answer failed, describing from the catalog:', e.code, e.detail || ''); }
      if (!reply) { fallback = true; reply = describeProjects(recommended); }
      return Object.assign(base, { kind: 'answer', fallback, reply, recommendedIds: recommended.map(d => d.id) });
    }
    if (read.intent === 'other' || (read.intent === 'question' && !recommended.length)) {
      const reply = String(read.reply || '').trim() || OFF_TOPIC;
      return Object.assign(base, { kind: 'reply', reply, recommendedIds: recommended.map(d => d.id) });
    }
    const hasField = profile.interests.length || profile.skills.length || profile.languages.length || profile.targetRole || profile.paths.length;
    if (read.followUp && questionsAsked < LIMITS.maxFollowups && !hasField) {
      return Object.assign(base, { kind: 'question', question: String(read.followUp).trim().slice(0, 300), profile, recommendedIds: recommended.map(d => d.id) });
    }
    if (!hasField) {
      return Object.assign(base, { kind: 'question', question: questionsAsked < LIMITS.maxFollowups ? 'What role are you after, or what can you already do? A job title, a field or a tool you know is enough.' : 'Tell me a role, a field or a tool you know and I will look through the catalog.', profile, recommendedIds: recommended.map(d => d.id) });
    }

    // 2. deterministic retrieval
    const r = retrieve(data.projects, profile, { limit: LIMITS.candidates });
    log('retrieve', { paths: r.paths, level: r.level, candidates: r.scores, strong: r.strong, notes: r.notes });
    const notes = {
      path: r.paths.length ? `${r.paths.map(p => PATHS[p]).join(' and ')} path${r.paths.length > 1 ? 's' : ''} ranked first; other paths still searched` : 'no path named, so all eight paths were searched',
      level: r.level === 'beginner' ? (r.notes.includes('widened-level') ? 'beginner: advanced projects hidden, but too few fit, so some are included and marked' : 'beginner: advanced projects hidden') : r.level === 'any' ? 'level not given, so all levels' : `${r.level}: all levels, ${r.level === 'intermediate' ? 'advanced ranked lower' : 'beginner ranked lower'}`,
      time: r.hours ? `about ${r.hours} hours available: longer projects ranked lower${r.notes.includes('over-time') ? ' and marked' : ''}` : null,
      aboveLevel: r.scores.filter(s => s.aboveLevel).map(s => s.id),
      overTime: r.scores.filter(s => s.overTime).map(s => s.id),
      catalog_size: data.projects.length, searched: r.poolSize, matched: r.candidates.length,
    };
    if (!r.candidates.length || r.strong === 0) {
      const closest = r.candidates.slice(0, 3).map(d => publicProject(d));
      return Object.assign(base, { kind: 'nomatch', profile, filters: notes,
        summary: `No strong matches in the catalog for ${describe(profile)}. ${closest.length ? 'The closest projects are below, but none is a clear fit.' : 'Nothing in the catalog came close.'}`,
        adjustments: r.adjustments.slice(0, 4), closest, recommendedIds: closest.map(c => c.id) });
    }

    // 3. rank and explain. Without the model, the search's own order stands and the cards
    // carry no "why it fits"; every one of them still names the visitor's field.
    let ranked = null;
    if (!fallback) {
      try { ranked = (await client.complete(prompts.rankMessages(profile, r.candidates, notes), { schema: prompts.RANK_SCHEMA, schemaName: 'ranking', maxTokens: cfg.maxTokens })).json || {}; }
      catch (e) { if (!(e instanceof ModelError)) throw e; warn('ranking failed, keeping search order:', e.code, e.detail || ''); }
    }
    if (!ranked) {
      fallback = true;
      const strongIds = r.scores.filter(s => s.core && s.score >= STRONG).map(s => s.id);
      ranked = { summary: `Here are the closest projects in the catalog for ${describe(profile)}.`, matches: strongIds.map(id => ({ id, why: '', gaps: [] })), adjustments: [] };
    }
    const candById = new Map(r.candidates.map(d => [d.id, d]));
    const seen = new Set(); const matches = [];
    for (const m of (Array.isArray(ranked.matches) ? ranked.matches : [])) {
      const d = m && candById.get(String(m.id));
      if (!d || seen.has(d.id)) continue;   // an id the search did not return cannot be recommended
      seen.add(d.id);
      const gaps = [...new Set((Array.isArray(m.gaps) ? m.gaps : []).map(n => parseInt(n, 10)).filter(n => n >= 0 && n < d.skills.length))].sort((a, b) => a - b);
      const sc = r.scores.find(s => s.id === d.id) || {};
      matches.push({ project: publicProject(d), why: String(m.why || '').trim().slice(0, 600), aboveLevel: !!sc.aboveLevel, overTime: !!sc.overTime,
        gaps: gaps.map(i => d.skills[i].text), gapIndexes: gaps });
      if (matches.length >= LIMITS.maxMatches) break;
    }
    if (!matches.length) {
      const closest = r.candidates.slice(0, 3).map(d => publicProject(d));
      return Object.assign(base, { kind: 'nomatch', profile, filters: notes, summary: String(ranked.summary || '').trim() || `No strong matches in the catalog for ${describe(profile)}.`,
        adjustments: [...new Set([...(Array.isArray(ranked.adjustments) ? ranked.adjustments.map(String) : []), ...r.adjustments])].slice(0, 4), closest, recommendedIds: closest.map(c => c.id) });
    }
    return Object.assign(base, { kind: 'results', fallback, profile, filters: notes, summary: String(ranked.summary || '').trim().slice(0, 1200), matches,
      adjustments: matches.length < 3 ? [...new Set([...(Array.isArray(ranked.adjustments) ? ranked.adjustments.map(String) : []), ...r.adjustments])].slice(0, 4) : [],
      recommendedIds: matches.map(m => m.project.id) });
  }

  // (req, res) in the Node style Vercel's functions use.
  async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const send = (code, obj) => { res.statusCode = code; res.end(JSON.stringify(obj)); };
    try {
      if (req.method === 'GET') return send(200, status());
      if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return send(405, { error: 'Use POST.', code: 'method' }); }
      const lim = limiter.check(clientIp(req));
      if (!lim.ok) { res.setHeader('Retry-After', String(lim.retryAfter)); return send(429, { error: lim.reason === 'daily' ? `${NAME} has reached its daily limit. Try again tomorrow, or use Career Match.` : 'Too many requests. Wait a minute and try again.', code: 'rate_limited', retryAfter: lim.retryAfter }); }
      const body = await readBody(req);
      return send(200, await run(body || {}));
    } catch (e) {
      if (e instanceof HttpError) return send(e.status, { error: e.message, code: e.code });
      if (e instanceof ModelError) { log('model error', e.code, e.detail); return send(e.status || 502, { error: e.message, code: e.code }); }
      log('error', e && e.stack || e);
      return send(500, { error: 'Something went wrong on the server.', code: 'server' });
    }
  }
  handler.run = run; handler.status = status; handler.cfg = cfg;
  return handler;
}

export const OFF_TOPIC = `I only know this site's projects, so I cannot help with that. I can recommend projects for the role you want, read you what a project builds, or point you to Christian's Opportunity Board for listings and to ResumeCanvas for your résumé. Tell me the role you are after and what you can already do.`;

// A profile read from the visitor's words with no model: the field words they used (the
// search drops filler like "projects" or "internship" itself), the level and the time they
// named. Every user turn counts, so an answer to an earlier follow-up still applies.
const FILLER = new Set(['a', 'an', 'i', 'im', "i'm", 'me', 'my', 'in', 'on', 'at', 'to', 'of', 'or', 'is', 'am', 'are', 'any', 'some', 'near', 'around', 'looking', 'want', 'need', 'find', 'show', 'get', 'can', 'you', 'please', 'good', 'best', 'that', 'this', 'what', 'where', 'there', 'from', 'about', 'like', 'also', 'should', 'would', 'could', 'do', 'does', 'be', 'build', 'make', 'help', 'something', 'per', 'week', 'hours', 'hour', 'day', 'days', 'month', 'months', 'only', 'just', 'not', 'no', 'yes', 'but', 'and', 'for', 'with', 'we', 'our', 'they', 'their', 'seeking', 'hiring', 'who', 'will', 'you\'ll', 'must', 'have', 'has', 'had', 'into', 'as', 'by', 'us', 'it', 'its', 'if', 'so', 'up', 'out', 'one', 'two', 'three']);
export function keywordRead(messages) {
  const text = messages.filter(m => m.role === 'user').map(m => m.content).join(' ').toLowerCase();
  const words = text.replace(/[^a-z0-9+#&./\s-]/g, ' ').split(/\s+/).map(w => w.replace(/^[-./]+|[-./]+$/g, '')).filter(w => w.length > 1 && !FILLER.has(w) && !/^\d+$/.test(w) && !STOP.has(w));
  const level = /\b(beginner|new to|no experience|never built|first project|just starting|starting out)\b/.test(text) ? 'beginner' : /\b(advanced|senior|experienced|years of experience)\b/.test(text) ? 'advanced' : /\b(intermediate|some experience|built a few|built some)\b/.test(text) ? 'intermediate' : 'unknown';
  const hm = /(\d+)\s*(?:hours?|hrs?)\b(?:\s*(?:a|per)\s*week\s*(?:for\s*(\d+)\s*(weeks?|months?))?)?/.exec(text);
  let hours = null;
  if (hm) { hours = parseInt(hm[1], 10); if (/a week|per week/.test(hm[0])) hours *= hm[2] ? parseInt(hm[2], 10) * (/month/.test(hm[3]) ? 4 : 1) : 4; }
  else if (/\ba weekend\b/.test(text)) hours = 12;
  const interests = [...new Set(words)].slice(0, 14);
  return {
    intent: 'search', followUp: '', reply: '',
    profile: { interests, skills: [], languages: [], targetRole: '', paths: inferPaths(interests).slice(0, 2), level, experience: level === 'beginner' ? 'none' : 'unknown', hoursAvailable: hours },
  };
}

export function normaliseProfile(p) {
  p = p && typeof p === 'object' ? p : {};
  const list = v => (Array.isArray(v) ? v : []).map(x => String(x || '').trim().toLowerCase()).filter(Boolean).slice(0, 12);
  const hours = typeof p.hoursAvailable === 'number' && Number.isFinite(p.hoursAvailable) && p.hoursAvailable > 0 ? Math.min(2000, Math.round(p.hoursAvailable)) : null;
  return {
    interests: list(p.interests), skills: list(p.skills), languages: list(p.languages),
    targetRole: String(p.targetRole || '').trim().slice(0, 120),
    paths: [...new Set(list(p.paths).filter(x => PATHS[x]))].slice(0, 3),
    level: ['beginner', 'intermediate', 'advanced'].includes(p.level) ? p.level : 'unknown',
    experience: ['none', 'some', 'experienced'].includes(p.experience) ? p.experience : 'unknown',
    hoursAvailable: hours,
  };
}
function describe(p) {
  const what = [p.targetRole, ...p.interests, ...p.skills].filter(Boolean).slice(0, 3).join(', ') || 'what you described';
  return what + (p.level !== 'unknown' ? ` at ${p.level} level` : '');
}
// The no-model answer to a question about the shown projects: what the catalog says, read out.
function describeProjects(list) {
  return list.slice(0, 3).map(d => `${d.title} is a ${d.level} ${d.pathName} project${d.hours ? ', ' + d.hours.text + ' over ' + d.steps.length + ' steps' : ''}. It builds ${d.skills.map(s => s.text).join(', ').toLowerCase()} with ${d.tech.join(', ')}. ${d.summary}`).join(' ') + ' For anything else, open the project on the site.';
}
