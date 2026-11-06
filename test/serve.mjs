// A local server for the agent: the static files from this folder (and public/) plus
// /api/assistant, the same handler Vercel runs. With --fake (or FAKE=1) the model is the
// scripted stand-in from fake-gateway.js, so the whole flow runs with no key and no network;
// without it the real gateway is called with AI_GATEWAY_API_KEY from the environment.
//   node test/serve.mjs [--fake] [--port 3000] [--sample] [--gate off]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHandler } from '../lib/assistant/handler.js';

const args = process.argv.slice(2);
const fake = args.includes('--fake') || process.env.FAKE === '1';
const sample = args.includes('--sample');
const port = parseInt(args[args.indexOf('--port') + 1], 10) || parseInt(process.env.PORT, 10) || 3000;
const gate = args.includes('--gate') ? args[args.indexOf('--gate') + 1] : (process.env.ASSISTANT_GATE || 'on');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = Object.assign({}, process.env, { ASSISTANT_GATE: gate });
const opts = { env, catalogPath: sample ? path.join(root, 'no-such-catalog.html') : path.join(root, 'index.html') };
if (fake) { const { fakeGateway } = await import('./fake-gateway.js'); opts.fetch = fakeGateway().fetch; env.AI_GATEWAY_API_KEY = env.AI_GATEWAY_API_KEY || 'fake-key'; env.ASSISTANT_ENABLED = env.ASSISTANT_ENABLED || 'true'; }
const handler = createHandler(opts);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/api/assistant') return handler(req, res);
  let file = url.pathname === '/' ? '/index.html' : url.pathname;
  if (!path.extname(file)) file += '.html';
  // Vite serves public/ at the root; do the same here (theme.js, voice.js, fonts).
  const tries = [path.join(root, path.normalize(file)), path.join(root, 'public', path.normalize(file))];
  const p = tries.find(f => f.startsWith(root) && fs.existsSync(f) && !fs.statSync(f).isDirectory());
  if (!p) { res.statusCode = 404; return res.end('not found'); }
  res.setHeader('Content-Type', TYPES[path.extname(p)] || 'application/octet-stream');
  fs.createReadStream(p).pipe(res);
});
server.listen(port, () => console.log(`Scout preview on http://localhost:${port}/assistant.html  (${fake ? 'fake model' : 'live gateway'}${sample ? ', sample data' : ''}, gate ${gate})`));
