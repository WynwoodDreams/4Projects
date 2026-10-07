// POST /api/premium-login  { password }  ->  { token, exp }
//
// Rate limiting is left to Vercel's platform-level protection; the password
// comparison is constant-time and a wrong guess waits half a second so a
// script cannot hammer it cheaply.

import { checkPassword, isConfigured, issueToken, json, readJsonBody } from './_premium-auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'POST only' });
  if (!isConfigured()) return json(res, 503, { error: 'Premium access is not configured yet. Set PREMIUM_PASSWORD in Vercel.' });

  const { password } = await readJsonBody(req);
  if (!checkPassword(password)) {
    await new Promise(r => setTimeout(r, 500));
    return json(res, 401, { error: 'That password is not right.' });
  }
  return json(res, 200, issueToken());
}
