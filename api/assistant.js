// /api/assistant: Scout, the projects page's agent. All of the work is in lib/assistant;
// this file only exists so Vercel deploys it as a function. Credentials stay in the
// server's environment (AI_GATEWAY_API_KEY); nothing in the page knows them.
import { createHandler } from '../lib/assistant/handler.js';

export default createHandler();
