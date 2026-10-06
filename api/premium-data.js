// GET /api/premium-data  (Authorization: Bearer <token>)  ->  { roles, updated }
//
// Returns the whole premium dataset; matching the typed role to an entry
// happens in the page so a visitor can try several roles without a round
// trip. The data lives in premium-data/roles.mjs, which is imported here and
// therefore bundled into the function, never served as a static file.

import { bearer, json, verifyToken } from './_premium-auth.js';
import { ROLES, UPDATED } from '../premium-data/roles.mjs';

export default function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'GET only' });
  if (!verifyToken(bearer(req))) return json(res, 401, { error: 'Sign in again.' });
  return json(res, 200, { roles: ROLES, updated: UPDATED });
}
