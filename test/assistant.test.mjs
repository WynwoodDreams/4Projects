// The agent's engine, driven end to end with no key and no network: every model call goes
// to the scripted stand-in in fake-gateway.js.
//   npm test
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createHandler, LIMITS, keywordRead, OFF_TOPIC } from '../lib/assistant/handler.js';
import { retrieve, inferPaths, expandTerms } from '../lib/assistant/retrieve.js';
import { loadCatalog, parseHours, publicProject } from '../lib/assistant/catalog.js';
import { extractJson } from '../lib/assistant/model.js';
import { fakeGateway, dataOf } from './fake-gateway.js';

// ASSISTANT_GATE is off here so the scenarios can call run() without a visitor; the gate has its own test.
const ENV = { AI_GATEWAY_API_KEY: 'test-key', ASSISTANT_ENABLED: 'true', ASSISTANT_GATE: 'off' };
const catalog = path.join(process.cwd(), 'index.html');
const make = (opts = {}) => { const gw = fakeGateway(opts.gateway); return { gw, h: createHandler({ env: Object.assign({}, ENV, opts.env), fetch: gw.fetch, catalogPath: opts.catalogPath || catalog, log: () => {}, warn: () => {} }) }; };
const P = () => loadCatalog({ catalogPath: catalog }).projects;

test('the catalog loads from index.html with skills split and hours summed', () => {
  const d = loadCatalog({ catalogPath: catalog });
  assert.equal(d.source, 'catalog'); assert.ok(d.projects.length >= 60);
  assert.match(d.updated, /^\d{4}-\d{2}-\d{2}$/);
  const p = d.projects.find(x => x.id === 'cy-5');
  assert.ok(p); assert.equal(p.path, 'cyber'); assert.equal(p.pathName, 'Cybersecurity');
  assert.ok(p.skills.length >= 3 && p.skills.every((s, i) => s.i === i && s.text));
  assert.ok(p.hours && p.hours.min > 0 && p.hours.max >= p.hours.min);
  assert.deepEqual(parseHours('1 to 2 hours'), [1, 2]); assert.deepEqual(parseHours('30 minutes'), [0.5, 0.5]); assert.deepEqual(parseHours('2 to 3 hours plus the soak'), [2, 3]);
  const pub = publicProject(p);
  assert.equal(pub.url, '/#project=cy-5'); assert.equal(pub.source, 'catalog'); assert.ok(!('pitch' in pub));
});
test('the sample set stands in, clearly labelled, when the catalog cannot be read', () => {
  const d = loadCatalog({ catalogPath: '/nowhere/index.html', fresh: true });
  assert.equal(d.source, 'sample'); assert.ok(d.projects.every(p => p.id.startsWith('sample-')));
  loadCatalog({ catalogPath: catalog, fresh: true });
});
test('words widen through the synonym map and name a path', () => {
  const t = expandTerms(['cybersecurity']);
  for (const w of ['soc', 'threat', 'grc', 'siem']) assert.ok(t.has(w), w);
  assert.deepEqual(inferPaths(['cybersecurity'])[0], 'cyber');
  assert.deepEqual(inferPaths(['help desk technician'])[0], 'helpdesk');
  assert.deepEqual(inferPaths(['marine biology']), []);
});
test('retrieval is deterministic on level: a beginner never sees an advanced-only project unless nothing else fits', () => {
  const r = retrieve(P(), { interests: ['cybersecurity'], level: 'beginner' });
  assert.ok(r.candidates.length >= 3);
  assert.ok(r.candidates.every(d => d.level !== 'advanced'));
  assert.ok(r.candidates.some(d => d.path === 'cyber'));
  assert.ok(!r.notes.includes('widened-level'));
  // a field only advanced projects cover widens, and says so
  const r2 = retrieve(P(), { interests: ['raft consensus', 'supply-chain signing sbom'], level: 'beginner' });
  assert.ok(r2.notes.includes('widened-level')); assert.ok(r2.scores.some(s => s.aboveLevel));
  const r3 = retrieve(P(), { interests: ['marine biology', 'scuba diving'], level: 'unknown' });
  assert.equal(r3.strong, 0); assert.ok(r3.adjustments.length >= 2);
  // time is a discount, not a filter
  const r4 = retrieve(P(), { interests: ['cloud'], hoursAvailable: 6 });
  assert.ok(r4.scores.some(s => s.overTime));
});
test('extractJson copes with fences and prose', () => {
  assert.deepEqual(extractJson('Sure:\n```json\n{"a":1}\n```'), { a: 1 });
  assert.deepEqual(extractJson('{"a":[1,2]} trailing'), { a: [1, 2] });
  assert.throws(() => extractJson('nothing here'));
});

test('GET reports status without touching the model', async () => {
  const { h, gw } = make();
  const st = h.status();
  assert.equal(st.name, 'Scout'); assert.equal(st.enabled, true); assert.equal(st.model, 'minimax/minimax-m3.1-flash'); assert.deepEqual(st.providers, ['minimax']); assert.equal(gw.calls.length, 0);
  assert.ok(st.projects >= 60); assert.equal(st.source, 'catalog');
  const off = make({ env: { ASSISTANT_ENABLED: 'false' } }).h.status();
  assert.equal(off.enabled, false); assert.equal(off.paused, true);
});

test('scenario 1: a beginner after a SOC analyst role gets ranked catalog projects with gaps from the skill list', async () => {
  const { h, gw } = make();
  const r = await h.run({ messages: [{ role: 'user', content: 'I want a SOC analyst job. I know some Python and Linux, no experience, beginner.' }], recommendedIds: [] });
  assert.equal(r.kind, 'results'); assert.ok(r.matches.length >= 1 && r.matches.length <= 5);
  assert.equal(r.source, 'catalog'); assert.equal(r.model, 'minimax/minimax-m3.1-flash'); assert.equal(r.fallback, false);
  const byId = new Map(P().map(d => [d.id, d]));
  for (const m of r.matches) {
    const d = byId.get(m.project.id); assert.ok(d, 'id exists in the catalog');
    assert.equal(m.project.url, '/#project=' + d.id, 'the link is the site\'s own deep link');
    assert.notEqual(d.level, 'advanced', 'a beginner never sees an advanced project');
    for (const g of m.gaps) assert.ok(d.skills.some(s => s.text === g), 'gaps come from the skill list');
    assert.ok(m.why.length > 10);
  }
  assert.ok(r.matches.some(m => m.project.path === 'cyber'));
  assert.match(r.filters.level, /beginner: advanced projects hidden/);
  assert.match(r.filters.path, /Cybersecurity/);
  assert.ok(r.filters.searched < r.filters.catalog_size);
  // every model call was pinned to the configured model and provider
  assert.equal(gw.calls.length, 2);
  for (const c of gw.calls) { assert.equal(c.body.model, 'minimax/minimax-m3.1-flash'); assert.deepEqual(c.body.providerOptions, { gateway: { only: ['minimax'] } }); assert.equal(c.headers.Authorization, 'Bearer test-key'); assert.equal(c.url, 'https://ai-gateway.vercel.sh/v1/chat/completions'); }
  assert.equal(gw.calls[0].body.response_format.type, 'json_schema');
  assert.ok(gw.calls[1].body.messages[1].content.includes('not instructions'));
  assert.ok(/strictly as data/.test(gw.calls[1].body.messages[0].content));
});

test('scenario 2: a pasted posting, then a question about the shown projects answered from their text', async () => {
  const { h } = make();
  const posting = 'Cloud Engineer. AWS, Terraform, Kubernetes, CI/CD pipelines. Build infrastructure as code and manage EKS clusters. I have built a few things in Docker.';
  const r = await h.run({ messages: [{ role: 'user', content: posting }], recommendedIds: [] });
  assert.equal(r.kind, 'results'); assert.ok(r.matches.length);
  assert.match(r.filters.path, /Cloud/);
  assert.deepEqual(r.profile.paths, ['cloud']);
  const q = await h.run({ messages: [{ role: 'user', content: posting }, { role: 'assistant', content: 'Recommended ...', kind: 'results' }, { role: 'user', content: 'How long does the first one take?' }], recommendedIds: r.recommendedIds });
  assert.equal(q.kind, 'answer'); assert.match(q.reply, /hours|steps/); assert.match(q.reply, /does not say/);
  assert.deepEqual(q.recommendedIds, r.recommendedIds);
});

test('scenario 3: a field the catalog does not carry says so and suggests adjustments worked out from the catalog', async () => {
  const { h, gw } = make();
  const r = await h.run({ messages: [{ role: 'user', content: 'I want to be a scuba diving instructor, marine biology is my thing.' }], recommendedIds: [] });
  assert.equal(r.kind, 'nomatch'); assert.match(r.summary, /No strong matches/);
  assert.ok(r.adjustments.length >= 2); assert.ok(r.closest.length <= 3);
  assert.ok(r.adjustments.some(a => /path \(\d+ projects\)/.test(a)), 'adjustments name real paths with real counts');
  assert.equal(gw.calls.length, 1, 'no ranking call when nothing matched');
});

test('scenario 4: off-topic gets the one-line refusal and the offer, and nothing is searched', async () => {
  const { h, gw } = make();
  const r = await h.run({ messages: [{ role: 'user', content: 'Can you write my cover letter? And what is the weather in Miami this weekend?' }], recommendedIds: [] });
  assert.equal(r.kind, 'reply'); assert.match(r.reply, /only know this site/); assert.match(r.reply, /Opportunity Board|ResumeCanvas/);
  assert.equal(gw.calls.length, 1);
  const r2 = await make({ gateway: { read: () => ({ intent: 'other', profile: {}, followUp: null, reply: '' }) } }).h.run({ messages: [{ role: 'user', content: 'tell me a joke' }] });
  assert.equal(r2.reply, OFF_TOPIC);
});

test('follow-up questions stop at three', async () => {
  const { h } = make();
  const msgs = [{ role: 'user', content: 'hello, I need something' }];
  const r1 = await h.run({ messages: msgs, recommendedIds: [] });
  assert.equal(r1.kind, 'question');
  const three = [...msgs, { role: 'assistant', content: 'q1', kind: 'question' }, { role: 'user', content: 'not sure' }, { role: 'assistant', content: 'q2', kind: 'question' }, { role: 'user', content: 'hmm' }, { role: 'assistant', content: 'q3', kind: 'question' }, { role: 'user', content: 'dunno' }];
  const r2 = await h.run({ messages: three, recommendedIds: [] });
  assert.equal(r2.kind, 'question'); assert.match(r2.question, /Tell me a role/);
});

test('ids the search did not return cannot be recommended, and gap indexes are checked', async () => {
  const { h } = make({ gateway: { rank: body => ({ summary: 'x', matches: [{ id: 'made-up-id', why: 'nope', gaps: [] }, { id: dataOf(body)[0].id, why: 'ok', gaps: [99, -1, 0, 0] }], adjustments: [] }) } });
  const r = await h.run({ messages: [{ role: 'user', content: 'cybersecurity student, beginner' }], recommendedIds: [] });
  assert.equal(r.kind, 'results'); assert.equal(r.matches.length, 1); assert.notEqual(r.matches[0].project.id, 'made-up-id');
  assert.equal(r.matches[0].gaps.length, 1); assert.deepEqual(r.matches[0].gapIndexes, [0]);
});

test('input limits, the pause switch and a missing key come back as clear errors', async () => {
  const { h } = make();
  await assert.rejects(h.run({ messages: [] }), /at least one message/);
  await assert.rejects(h.run({ messages: [{ role: 'user', content: 'x'.repeat(LIMITS.maxMessageChars + 1) }] }), /under 1500/);
  await assert.rejects(make({ env: { ASSISTANT_ENABLED: 'false' } }).h.run({ messages: [{ role: 'user', content: 'hi' }] }), /paused/);
  await assert.rejects(make({ env: { AI_GATEWAY_API_KEY: '' } }).h.run({ messages: [{ role: 'user', content: 'hi' }] }), /not configured/);
});

test('when the model fails, the visitor still gets projects: a keyword search of the catalog, and a warning in the log', async () => {
  // Bad credentials, rate limits, no credit, a server error, a provider outside the allowed
  // list and a reply that stays empty all end the same way for the visitor: the catalog
  // searched on their own words, with no "why it fits", instead of an error about the model.
  for (const gateway of [{ fail: { status: 401 } }, { fail: { status: 429 } }, { fail: { status: 402 } }, { fail: { status: 500 } }, { served: 'someone-else' }, { empty: 99 }]) {
    const warned = []; const gw = fakeGateway(gateway);
    const h = createHandler({ env: ENV, fetch: gw.fetch, catalogPath: catalog, log: () => {}, warn: (...a) => warned.push(a.join(' ')) });
    const r = await h.run({ messages: [{ role: 'user', content: 'cybersecurity projects for a SOC analyst, I am a beginner' }] });
    assert.equal(r.kind, 'results', JSON.stringify(gateway)); assert.equal(r.fallback, true);
    assert.ok(r.matches.length >= 1 && r.matches.length <= 5);
    for (const m of r.matches) { assert.equal(m.why, ''); assert.deepEqual(m.gaps, []); assert.match(m.project.title + ' ' + m.project.pathName + ' ' + m.project.skills.join(' '), /cyber|security|soc/i); assert.notEqual(m.project.level, 'advanced'); }
    assert.match(r.filters.level, /beginner/);
    assert.doesNotMatch(r.summary, /model|gateway/i);
    assert.ok(warned.some(w => /intake failed/.test(w)), 'the fallback is logged');
  }
  // a question about the shown projects with no model is answered from the catalog text
  const gw = fakeGateway({ empty: 99 });
  const h = createHandler({ env: ENV, fetch: gw.fetch, catalogPath: catalog, log: () => {}, warn: () => {} });
  const r = await h.run({ messages: [{ role: 'user', content: 'cybersecurity beginner' }] });
  const q = await h.run({ messages: [{ role: 'user', content: 'cybersecurity beginner' }, { role: 'assistant', content: 'ok', kind: 'results' }, { role: 'user', content: 'how long does the first one take?' }], recommendedIds: r.recommendedIds });
  assert.ok(q.kind === 'results' || q.kind === 'answer');
});

test('an empty reply is retried once with more room before falling back', async () => {
  const { h, gw } = make({ gateway: { empty: 1 } });
  const r = await h.run({ messages: [{ role: 'user', content: 'I want a SOC analyst job, beginner, I know Linux.' }] });
  assert.equal(r.kind, 'results'); assert.equal(r.fallback, false);
  assert.ok(r.matches.every(m => m.why.length > 10), 'the model ranked these');
  assert.equal(gw.calls.length, 3);
  assert.equal(gw.calls[1].body.max_tokens, gw.calls[0].body.max_tokens * 2);
});

test('the keyword fallback reads level and time out of the visitor\'s words', () => {
  const p = keywordRead([{ role: 'user', content: 'Beginner data analyst, I know Excel, 5 hours a week for 2 months' }]).profile;
  assert.equal(p.level, 'beginner'); assert.equal(p.hoursAvailable, 40); assert.deepEqual(p.paths[0], 'data');
  assert.ok(p.interests.includes('excel'));
  assert.equal(keywordRead([{ role: 'user', content: 'cloud stuff, a weekend' }]).profile.hoursAvailable, 12);
});

test('the model is configurable', async () => {
  const { h, gw } = make({ env: { ASSISTANT_MODEL: 'minimax/other-model', ASSISTANT_PROVIDERS: 'minimax,other' } });
  await h.run({ messages: [{ role: 'user', content: 'cybersecurity beginner' }], recommendedIds: [] });
  assert.equal(gw.calls[0].body.model, 'minimax/other-model'); assert.deepEqual(gw.calls[0].body.providerOptions.gateway.only, ['minimax', 'other']);
});

test('the HTTP handler rate-limits and answers GET/POST', async () => {
  const { h } = make();
  const call = (method, body, ip = '1.1.1.1') => new Promise(resolve => {
    const headers = {}; let code = 200; let out = '';
    const res = { setHeader: (k, v) => { headers[k] = v; }, set statusCode(c) { code = c; }, get statusCode() { return code; }, end: s => { out += s; resolve({ code, headers, body: JSON.parse(out) }); } };
    h({ method, headers: { 'x-forwarded-for': ip }, body }, res);
  });
  const g = await call('GET'); assert.equal(g.code, 200); assert.equal(g.body.enabled, true); assert.equal(g.body.name, 'Scout');
  const p = await call('POST', { messages: [{ role: 'user', content: 'cybersecurity beginner' }] }); assert.equal(p.code, 200); assert.equal(p.body.kind, 'results');
  const bad = await call('POST', { messages: [] }); assert.equal(bad.code, 400);
  let last; for (let i = 0; i < LIMITS.perMinute + 2; i++) last = await call('POST', { messages: [{ role: 'user', content: 'hi' }] }, '2.2.2.2');
  assert.equal(last.code, 429); assert.equal(last.headers['Retry-After'], '60');
  const m = await call('DELETE'); assert.equal(m.code, 405);
});

test('the beta gate: a name and a valid email are required on every turn, and the visitor is logged once', async () => {
  const lines = []; const orig = console.log; console.log = (...a) => lines.push(a.join(' '));
  try {
    const { h } = make({ env: { ASSISTANT_GATE: 'on' } });
    assert.equal(h.status().gate, true);
    assert.equal(make().h.status().gate, false);
    const msgs = [{ role: 'user', content: 'cybersecurity beginner' }];
    await assert.rejects(h.run({ messages: msgs }), /Enter your name/);
    await assert.rejects(h.run({ messages: msgs, visitor: { name: 'A', email: 'a@b.co' } }), /Enter your name/);
    await assert.rejects(h.run({ messages: msgs, visitor: { name: 'Ana', email: 'not-an-email' } }), /valid email/);
    const r = await h.run({ messages: msgs, visitor: { name: '  Ana  Diaz ', email: 'Ana@Example.com' } });
    assert.equal(r.kind, 'results');
    const logged = lines.filter(l => l.startsWith('[assistant] visitor'));
    assert.equal(logged.length, 1);
    assert.match(logged[0], /"name":"Ana Diaz"/); assert.match(logged[0], /"email":"ana@example.com"/);
    await h.run({ messages: [...msgs, { role: 'assistant', content: 'ok', kind: 'results' }, { role: 'user', content: 'any in cloud?' }], visitor: { name: 'Ana Diaz', email: 'ana@example.com' } });
    assert.equal(lines.filter(l => l.startsWith('[assistant] visitor')).length, 1);
    // the HTTP shape the page relies on: 400 with code "who"
    const res = await new Promise(resolve => { let code = 200, out = ''; h({ method: 'POST', headers: {}, body: { messages: msgs } }, { setHeader() {}, set statusCode(c) { code = c; }, get statusCode() { return code; }, end: s => { out += s; resolve({ code, body: JSON.parse(out) }); } }); });
    assert.equal(res.code, 400); assert.equal(res.body.code, 'who');
  } finally { console.log = orig; }
});

test('the beta gate: with Supabase configured each sign-in is inserted into bb_assistant_visitors, and a store failure does not reach the visitor', async () => {
  const orig = console.log; console.log = () => {};
  try {
    const calls = []; let status = 201;
    const storeFetch = async (url, init) => { calls.push({ url, init }); return { ok: status < 300, status, text: async () => 'nope' }; };
    const env = { ASSISTANT_GATE: 'on', SUPABASE_URL: 'https://x.supabase.co/', SUPABASE_SERVICE_ROLE_KEY: 'srk' };
    const gw = fakeGateway();
    const h = createHandler({ env: Object.assign({}, ENV, env), fetch: gw.fetch, storeFetch, catalogPath: catalog, log: () => {}, warn: () => {} });
    assert.equal(h.status().visitorStore, true);
    const msgs = [{ role: 'user', content: 'cybersecurity beginner' }];
    await h.run({ messages: msgs, visitor: { name: 'Ana Diaz', email: 'Ana@Example.com' } });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://x.supabase.co/rest/v1/bb_assistant_visitors');
    assert.equal(calls[0].init.headers.Authorization, 'Bearer srk');
    const row = JSON.parse(calls[0].init.body);
    assert.equal(row.name, 'Ana Diaz'); assert.equal(row.email, 'ana@example.com'); assert.equal(row.asked, 'cybersecurity beginner'); assert.ok(row.at);
    status = 500;
    const r = await h.run({ messages: msgs, visitor: { name: 'Bo Li', email: 'bo@example.com' } });
    assert.equal(r.kind, 'results'); assert.equal(calls.length, 2);
  } finally { console.log = orig; }
});
