// Shared auth helper for the premium page. Files in api/ that start with an
// underscore are not deployed as functions by Vercel, so this is import-only.
//
// The model is deliberately small: one shared password, set as the
// PREMIUM_PASSWORD environment variable in Vercel. A correct password buys a
// signed, time-limited token; the data endpoint only answers to a valid token.
// There are no accounts and nothing is stored server-side.

import { createHmac, createHash, timingSafeEqual } from 'node:crypto';

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Placeholder so the page can be tried before PREMIUM_PASSWORD exists in
// Vercel. The environment variable always wins when it is set. Change this
// (or set the variable) before handing the page to a cohort.
const PLACEHOLDER_PASSWORD = 'cloud2026';
const currentPassword = () => process.env.PREMIUM_PASSWORD || PLACEHOLDER_PASSWORD;

function secret() {
  const pw = currentPassword();
  if (!pw) return null;
  // Derive the signing key from the password so no second secret is needed.
  // Changing the password therefore also invalidates every issued token.
  return createHash('sha256').update('buildersbench-premium:' + pw).digest();
}

function sign(exp, key) {
  return createHmac('sha256', key).update(String(exp)).digest('hex');
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function isConfigured() {
  return Boolean(currentPassword());
}

export function usingPlaceholder() {
  return !process.env.PREMIUM_PASSWORD;
}

export function checkPassword(candidate) {
  const pw = currentPassword();
  if (!pw || typeof candidate !== 'string') return false;
  return safeEqual(candidate, pw);
}

export function issueToken() {
  const key = secret();
  if (!key) return null;
  const exp = Date.now() + TOKEN_TTL_MS;
  return { token: `${exp}.${sign(exp, key)}`, exp };
}

export function verifyToken(token) {
  const key = secret();
  if (!key || typeof token !== 'string') return false;
  const [expStr, sig] = token.split('.');
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now() || !sig) return false;
  return safeEqual(sig, sign(exp, key));
}

export function bearer(req) {
  const h = req.headers?.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7).trim() : '';
}

export function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) raw += chunk;
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}
