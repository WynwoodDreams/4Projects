// Drives assistant.html in a real browser against the fake gateway: a search, a follow-up,
// a no-match and an off-topic turn at 1280x845 and 390x844, plus a spoken exchange with a
// fake SpeechRecognition that hears a phrase and ends, so the auto-send and the hands-free
// loop are checked with no microphone. Reports page errors and the card height against
// the strip height. Needs Playwright with a Chromium; not part of `npm test`.
//   node test/agent-browser.mjs [--port 3123] [--shots dir]
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const port = parseInt(args[args.indexOf('--port') + 1], 10) || 3123;
const shots = args.includes('--shots') ? path.resolve(args[args.indexOf('--shots') + 1]) : '';
if (shots) fs.mkdirSync(shots, { recursive: true });
// Playwright is resolved the CommonJS way so a globally installed copy (NODE_PATH, a
// global node_modules) works as well as a local one.
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

// One server per viewport: the handler rate-limits per address (8 a minute), and a run
// at one size spends most of that.
async function serve(p) {
  const server = spawn(process.execPath, [path.join(root, 'test/serve.mjs'), '--fake', '--port', String(p)], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise(r => server.stdout.on('data', d => { if (/preview on/.test(String(d))) r(); }));
  return server;
}
let failed = 0;
const ok = (cond, what) => { console.log(`${cond ? 'ok   ' : 'FAIL '} ${what}`); if (!cond) failed++; };

// A stand-in for the browser's recogniser: start() "hears" the next phrase in the script
// after a short pause, reports it as a final result, then ends itself, the way the real
// one does when the visitor stops talking. An empty phrase is silence.
const FAKE_SR = `
  window.__heard = []; window.__srStarts = 0; window.__srAborts = 0;
  window.SpeechRecognition = class {
    constructor(){ this.lang = ''; this.interimResults = false; this.continuous = false; }
    start(){ window.__srStarts++; const phrase = window.__heard.shift();
      setTimeout(() => { if (this.__aborted) return;
        if (phrase) { this.onresult && this.onresult({ results: [[{ transcript: phrase }]] }); }
        else { this.onerror && this.onerror({ error: 'no-speech' }); }
        this.onend && this.onend(); }, phrase ? 250 : 400); }
    stop(){ this.onend && this.onend(); }
    abort(){ window.__srAborts++; this.__aborted = true; this.onerror && this.onerror({ error: 'aborted' }); this.onend && this.onend(); }
  };
  delete window.webkitSpeechRecognition;
`;

async function drive(viewport, label, p) {
  const server = await serve(p);
  const base = `http://localhost:${p}`;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.addInitScript(FAKE_SR);
  await page.goto(`${base}/assistant.html`);
  console.log(`\n== ${label} (${viewport.width}x${viewport.height})`);

  // the gate
  await page.waitForSelector('#gate:not([hidden])');
  ok(await page.isHidden('#bar'), 'the bar is hidden behind the gate');
  await page.fill('#g-name', 'Ana Diaz'); await page.fill('#g-email', 'ana@example.com'); await page.click('#gate button[type=submit]');
  await page.waitForSelector('#presence:not([hidden])');
  ok(/Hi Ana/.test(await page.textContent('#say')), 'the opening greets the visitor by name');
  ok(await page.evaluate(() => document.body.classList.contains('is-ready')), 'state is Ready before anyone talks');
  ok((await page.evaluate(() => JSON.parse(localStorage.getItem('bb.visitor')).email)) === 'ana@example.com', 'the visitor is kept in localStorage');
  const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(scrollW <= viewport.width, `no horizontal page scroll (${scrollW} <= ${viewport.width})`);
  if (shots) await page.screenshot({ path: path.join(shots, `${label}-opening.png`) });

  // a search, typed
  await page.fill('#input', 'I want a SOC analyst job. I know some Python and Linux, no experience yet.');
  await page.click('#send');
  await page.waitForSelector('#strip:not([hidden])');
  await page.waitForFunction(() => !document.body.classList.contains('is-thinking'));
  const cards = await page.$$('#film .card');
  ok(cards.length >= 1 && cards.length <= 5, `search shows ${cards.length} cards`);
  ok((await page.textContent('#film .card.top .lab')) === 'Closest fit', 'the first card is the closest fit');
  ok(/of \d+ projects searched/.test(await page.textContent('#searched')), 'the Searched-with strip shows the count');
  ok(/beginner/.test(await page.textContent('#searched')), 'the Searched-with strip shows the level filter');
  ok((await page.getAttribute('#film .card.top .btn-primary', 'href')).startsWith('/#project='), 'Open project is the site\'s own deep link');
  ok(/catalog/.test(await page.textContent('#film .card.top .src')), 'the honesty line is on the card');
  ok(/Scout · \d+ projects|\d+/.test(await page.textContent('#r-count')), 'the readout shows the project count');
  const measure = await page.evaluate(() => {
    const strip = document.getElementById('strip').getBoundingClientRect();
    const film = document.getElementById('film');
    const card = document.querySelector('#film .card.top').getBoundingClientRect();
    return { strip: Math.round(strip.height), card: Math.round(card.height), cardBottom: Math.round(card.bottom), filmScrollH: film.scrollHeight, filmClientH: film.clientHeight, viewportH: innerHeight, barTop: Math.round(document.querySelector('#bar form').getBoundingClientRect().top) };
  });
  const scrollW2 = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(scrollW2 <= viewport.width, `no horizontal page scroll with cards on screen (${scrollW2} <= ${viewport.width})`);
  console.log(`     card ${measure.card}px tall in a strip ${measure.strip}px tall; card bottom ${measure.cardBottom}px, bar top ${measure.barTop}px, viewport ${measure.viewportH}px`);
  if (viewport.width > 760) ok(measure.card <= measure.strip && measure.cardBottom <= measure.barTop, 'a whole card shows above the bar at this height');
  // open the folded requirements: the strip scrolls, the page does not
  await page.click('#film .card.top .asks summary');
  const after = await page.evaluate(() => ({ docScroll: document.documentElement.scrollHeight - innerHeight, film: document.getElementById('film').scrollHeight - document.getElementById('film').clientHeight }));
  ok(after.docScroll <= 0, `the page itself does not grow when a requirements list opens (overflow ${after.docScroll})`);
  console.log(`     the strip's own scroll room with a list open: ${after.film}px`);
  if (shots) await page.screenshot({ path: path.join(shots, `${label}-results.png`) });

  // a follow-up question about the shown projects
  await page.fill('#input', 'How long does the first one take?'); await page.click('#send');
  await page.waitForFunction(() => !document.body.classList.contains('is-thinking'));
  ok(/hours|steps/.test(await page.textContent('#say')), 'the follow-up is answered from the catalog text');
  ok((await page.$$('#film .card')).length === cards.length, 'the picks stay on screen after a follow-up');
  ok(/Conversation \(4 turns\)/.test(await page.textContent('#convo-sum')), 'the conversation popover counts the turns');

  // a no-match
  await page.fill('#input', 'I want to be a scuba diving instructor, marine biology is my thing.'); await page.click('#send');
  await page.waitForFunction(() => !document.body.classList.contains('is-thinking'));
  ok(/No strong matches/.test(await page.textContent('#say')), 'no-match says so');
  const chips = await page.$$eval('#chips button', bs => bs.map(b => b.textContent.trim()));
  ok(chips.length >= 2 && chips.some(c => /path \(\d+ projects\)/i.test(c)), `adjustment chips come from the catalog: ${chips.join(' | ')}`);
  // a chip sends itself
  await page.click('#chips button');
  await page.waitForFunction(() => document.body.classList.contains('is-thinking')).catch(() => {});
  await page.waitForFunction(() => !document.body.classList.contains('is-thinking'));
  ok((await page.evaluate(() => window.bbScout.history.filter(m => m.role === 'user').length)) === 4, 'the chip sent itself as the next message');

  // off-topic
  await page.fill('#input', 'Can you write my cover letter? And what is the weather this weekend?'); await page.click('#send');
  await page.waitForFunction(() => !document.body.classList.contains('is-thinking'));
  ok(/only know this site/.test(await page.textContent('#say')), 'off-topic gets the one-line refusal');
  const links = await page.$$eval('#chips a', as => as.map(a => a.href));
  ok(links.some(l => /cob-eta/.test(l)) && links.some(l => /resumecanvas/.test(l)), 'off-topic offers COB and ResumeCanvas');
  if (shots) await page.screenshot({ path: path.join(shots, `${label}-offtopic.png`) });

  // Start over
  await page.click('#restart');
  ok(await page.evaluate(() => document.getElementById('stage').classList.contains('opening') && document.getElementById('strip').hidden), 'Start over shows the opening again');

  // a spoken exchange: the fake recogniser hears a phrase, the page sends it with no tap on
  // Send, speaks the reply (no voices here, so the 1.5 s watchdog ends it) and listens
  // again by itself; then silence ends the loop
  await page.evaluate(() => { window.__heard = ['beginner data analyst, I know Excel', 'how long does the first one take', '']; });
  await page.click('#mic');
  ok(await page.evaluate(() => document.body.classList.contains('is-listening')), 'tapping the mic listens');
  await page.waitForFunction(() => window.bbScout.history.filter(m => m.role === 'user').length === 1, null, { timeout: 5000 });
  ok(true, 'a heard phrase was sent with no tap on Send');
  await page.waitForFunction(() => window.bbScout.history.filter(m => m.role === 'user').length === 2, null, { timeout: 12000 }).catch(() => {});
  const spokenTurns = await page.evaluate(() => window.bbScout.history.filter(m => m.role === 'user').map(m => m.content));
  ok(spokenTurns.length === 2 && /how long/.test(spokenTurns[1]), `the mic reopened after the reply and the next phrase was sent (${spokenTurns.length} spoken turns)`);
  await page.waitForFunction(() => /Tap the mic to talk again/.test(document.getElementById('fine').textContent), null, { timeout: 12000 }).catch(() => {});
  ok(/Tap the mic to talk again/.test(await page.textContent('#fine')), 'silence ends the loop quietly');
  ok(!(await page.evaluate(() => window.bbScout.listening)), 'the mic is closed after silence');
  const starts = await page.evaluate(() => window.__srStarts);
  ok(starts === 3, `the recogniser was started three times (${starts})`);
  // tapping the mic while it listens throws the half-heard words away
  await page.evaluate(() => { window.__heard = ['this should be thrown away']; });
  await page.click('#mic'); await page.click('#mic');
  await page.waitForTimeout(500);
  ok((await page.evaluate(() => window.__srAborts)) >= 1 && (await page.inputValue('#input')) === '', 'a second tap aborts and clears the box');
  ok((await page.evaluate(() => window.bbScout.history.filter(m => m.role === 'user').length)) === 2, 'nothing was sent from the aborted phrase');
  // typing ends the loop
  await page.evaluate(() => { window.__heard = ['cloud projects please', '']; });
  await page.click('#mic');
  await page.waitForFunction(() => window.bbScout.history.filter(m => m.role === 'user').length === 3, null, { timeout: 5000 });
  await page.waitForFunction(() => !document.body.classList.contains('is-thinking'));
  await page.type('#input', 'x');
  await page.waitForTimeout(600);
  ok(!(await page.evaluate(() => window.bbScout.lastWasSpoken)), 'typing ends the hands-free loop');

  // muting is remembered
  await page.click('#speaker');
  ok((await page.evaluate(() => localStorage.getItem('bb.scout.muted'))) === '1', 'the mute choice is remembered');

  if (shots) await page.screenshot({ path: path.join(shots, `${label}-voice.png`) });
  ok(errors.length === 0, errors.length ? `page errors: ${errors.join(' || ')}` : 'no page errors');
  await browser.close(); server.kill();
}

await drive({ width: 1280, height: 845 }, 'desktop', port);
await drive({ width: 390, height: 844 }, 'phone', port + 1);
console.log(failed ? `\n${failed} check(s) failed.` : '\nAll browser checks passed.');
process.exit(failed ? 1 : 0);
