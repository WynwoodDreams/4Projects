// Deterministic retrieval. The model never searches: it reads a profile out of what the
// visitor wrote, this file turns that profile into filters and a keyword score over the
// site's own catalog, and the model then ranks and explains only what came back. So a
// project the site does not carry cannot be recommended, and a level or time rule is
// applied the same way every time.
import { PATHS } from './catalog.js';

// Below this score a candidate is a weak lead, shown only as "closest in the catalog".
export const STRONG = 3;

// Words a visitor uses for a field, widened to the words the catalog uses for it. Each entry
// is matched as a whole word (or phrase) in the project's lower-cased text. The first key
// of each group is also the name of a career path, so naming the field names the path.
export const SYNONYMS = {
  cyber: ['cyber', 'cybersecurity', 'security', 'infosec', 'soc', 'threat', 'vulnerability', 'penetration', 'incident response', 'siem', 'grc', 'detection', 'blue team', 'red team', 'phishing', 'passkeys', 'webauthn', 'compliance', 'malware', 'supply-chain', 'signing'],
  cybersecurity: ['cyber'], security: ['cyber'], infosec: ['cyber'], 'information security': ['cyber'], soc: ['cyber', 'soc', 'siem', 'detection', 'log analysis'], grc: ['cyber', 'compliance', 'audit', 'governance'], 'penetration testing': ['cyber', 'penetration', 'red team', 'red-team'], pentest: ['cyber', 'penetration'],
  cloud: ['cloud', 'aws', 'azure', 'gcp', 'devops', 'kubernetes', 'serverless', 'lambda', 'terraform', 'docker', 'sre', 'platform', 'infrastructure', 'gitops', 'observability', 'cdn', 'fargate', 'helm'],
  devops: ['cloud', 'devops', 'ci/cd', 'pipeline', 'github actions'], aws: ['cloud', 'aws', 'lambda', 's3'], azure: ['cloud', 'azure', 'entra', 'microsoft 365'], kubernetes: ['cloud', 'kubernetes', 'k8s', 'helm'], sre: ['cloud', 'observability', 'monitoring'], infrastructure: ['cloud', 'infrastructure', 'terraform'],
  data: ['data', 'analytics', 'analyst', 'sql', 'dashboard', 'tableau', 'power bi', 'pandas', 'statistics', 'etl', 'elt', 'warehouse', 'lakehouse', 'dbt', 'airflow', 'forecasting', 'duckdb', 'visualization', 'bi'],
  'data analyst': ['data'], 'data analytics': ['data'], analytics: ['data'], 'data science': ['data', 'ai', 'machine learning', 'statistics'], 'data engineer': ['data', 'pipeline', 'etl', 'elt', 'airflow', 'dbt', 'warehouse'], 'business intelligence': ['data', 'bi', 'dashboard', 'power bi', 'tableau'], sql: ['data', 'sql'], excel: ['data', 'excel', 'spreadsheet', 'dashboard'], tableau: ['data', 'tableau'], 'power bi': ['data', 'power bi', 'dax'],
  ai: ['ai', 'agent', 'agents', 'llm', 'rag', 'machine learning', 'ml', 'embeddings', 'prompt', 'langchain', 'langgraph', 'evals', 'mcp', 'model', 'generative', 'claude', 'openai', 'multimodal', 'fine-tuning'],
  'artificial intelligence': ['ai'], 'machine learning': ['ai', 'machine learning', 'ml', 'model', 'scikit-learn', 'pytorch', 'tensorflow'], ml: ['ai', 'machine learning'], llm: ['ai', 'llm', 'rag', 'agent'], agents: ['ai', 'agent'], rag: ['ai', 'rag', 'vector', 'embeddings'], 'prompt engineering': ['ai', 'prompt'], 'ai engineer': ['ai'], genai: ['ai', 'generative'],
  swe: ['software', 'developer', 'engineer', 'backend', 'frontend', 'full stack', 'api', 'react', 'typescript', 'javascript', 'node', 'microservices', 'database', 'web', 'rest', 'openapi'],
  software: ['swe'], 'software engineer': ['swe'], 'software engineering': ['swe'], developer: ['swe'], programming: ['swe', 'programming', 'python'], backend: ['swe', 'backend', 'api', 'database'], frontend: ['swe', 'frontend', 'react', 'component', 'accessibility', 'ui'], 'full stack': ['swe', 'full stack', 'frontend', 'backend'], 'full-stack': ['full stack'], web: ['swe', 'web', 'react', 'frontend'], react: ['swe', 'react', 'component', 'typescript'], javascript: ['swe', 'javascript', 'node', 'typescript'], typescript: ['swe', 'typescript'], api: ['swe', 'api', 'rest', 'openapi'], mobile: ['swe', 'mobile', 'react'],
  cs: ['computer science', 'algorithms', 'data structures', 'distributed', 'compiler', 'systems', 'consensus', 'database', 'storage', 'concurrency', 'low-level', 'wasm', 'webassembly', 'raft'],
  'computer science': ['cs'], systems: ['cs', 'systems', 'distributed'], 'distributed systems': ['cs', 'distributed', 'consensus', 'raft', 'microservices'], compilers: ['cs', 'compiler', 'parser'], databases: ['cs', 'database', 'storage', 'sql'], algorithms: ['cs', 'algorithms', 'data structures'], 'operating systems': ['cs', 'systems', 'low-level'],
  helpdesk: ['help desk', 'service desk', 'ticket', 'tickets', 'ticketing', 'support', 'itsm', 'sla', 'jira', 'servicenow', 'intune', 'autopilot', 'power automate', 'copilot', 'sharepoint', 'onboarding'],
  'help desk': ['helpdesk'], 'service desk': ['helpdesk'], 'technical support': ['helpdesk', 'tech-it', 'support', 'troubleshooting'], 'customer support': ['helpdesk', 'support', 'ticket'], itsm: ['helpdesk', 'itsm', 'servicenow', 'jira'],
  'tech-it': ['it', 'it support', 'sysadmin', 'administrator', 'powershell', 'microsoft 365', 'active directory', 'entra', 'intune', 'network', 'vlan', 'dns', 'endpoint', 'windows', 'proxmox', 'ansible', 'homelab', 'home lab', 'troubleshooting'],
  it: ['tech-it'], 'it support': ['tech-it', 'helpdesk'], 'information technology': ['tech-it'], sysadmin: ['tech-it', 'sysadmin', 'powershell', 'ansible', 'linux'], 'system administrator': ['sysadmin'], 'systems administrator': ['sysadmin'], networking: ['tech-it', 'network', 'vlan', 'dns', 'firewall', 'wireshark', 'cyber'], network: ['networking'], windows: ['tech-it', 'windows', 'intune', 'powershell'], powershell: ['tech-it', 'powershell', 'microsoft 365', 'intune'], 'microsoft 365': ['tech-it', 'microsoft 365', 'entra', 'intune', 'sharepoint', 'helpdesk'], 'office 365': ['microsoft 365'], linux: ['linux', 'tech-it', 'cloud', 'cyber'],
  python: ['python', 'data', 'ai', 'swe'], java: ['java', 'swe'], go: ['go', 'golang', 'swe', 'cs'], golang: ['go'], rust: ['rust', 'cs'], 'c++': ['c++', 'cs', 'low-level'], docker: ['docker', 'cloud', 'containers'], git: ['git', 'github'], github: ['github', 'github actions', 'ci/cd'],
  automation: ['automation', 'power automate', 'powershell', 'scripting', 'ci/cd', 'workflow'], scripting: ['scripting', 'powershell', 'python', 'bash', 'automation'], monitoring: ['monitoring', 'observability', 'grafana', 'alerting', 'cloud'], observability: ['observability', 'grafana', 'opentelemetry', 'tracing', 'cloud'],
  internship: [], student: [], beginner: [],
};

// Filler the keyword fallback drops when it reads the visitor's own words.
export const STOP = new Set(['project', 'projects', 'build', 'building', 'portfolio', 'student', 'students', 'job', 'jobs', 'role', 'roles', 'position', 'positions', 'work', 'experience', 'the', 'and', 'with', 'for', 'something', 'anything', 'entry', 'level', 'entry-level', 'career', 'internship', 'internships', 'intern', 'junior', 'senior', 'want', 'wants', 'looking', 'need', 'know', 'learn', 'learning', 'hours', 'hour', 'week', 'weeks', 'weekend', 'time', 'year', 'years', 'some', 'can', 'already', 'beginner', 'intermediate', 'advanced', 'skills', 'skill', 'tools', 'tool', 'path', 'get', 'got', 'have', 'has', 'new', 'first']);

export function expandTerms(words) {
  const out = new Map();  // term -> weight (1 for a word the visitor used, .6 for a synonym)
  const add = (t, w) => { t = t.toLowerCase().trim(); if (t.length < 2) return; if (!out.has(t) || out.get(t) < w) out.set(t, w); };
  const seen = new Set();
  const walk = (t, w, depth) => {
    t = t.toLowerCase().trim(); if (!t || seen.has(t + depth)) return; seen.add(t + depth);
    add(t, w);
    const syn = SYNONYMS[t];
    if (!syn || depth > 1) return;
    for (const s of syn) { if (SYNONYMS[s] && s !== t && depth === 0) walk(s, w * 0.8, depth + 1); else add(s, w * 0.6); }
  };
  for (const w of words) {
    walk(String(w), 1, 0);
    // "cloud engineer" -> also try each word on its own once the phrase missed the table
    const own = !!SYNONYMS[String(w).toLowerCase().trim()];
    for (const part of String(w).toLowerCase().split(/[\s,/&]+/)) if (part.length > 2 && part !== w.toLowerCase() && !STOP.has(part)) walk(part, own ? 0.7 : 1, 1);
  }
  return out;
}

// Which career path the visitor's words point at, worked out from the same synonym table:
// a term that is a path id, or widens to one, votes for it.
export function inferPaths(words) {
  const votes = new Map();
  const vote = (t, weight) => {
    if (PATHS[t]) { votes.set(t, (votes.get(t) || 0) + weight * 2); return; }
    for (const p of (SYNONYMS[t] || []).filter(s => PATHS[s])) votes.set(p, (votes.get(p) || 0) + weight);
  };
  for (const w of words) {
    const t = String(w).toLowerCase().trim();
    vote(t, 1);
    // "help desk technician": the phrase misses the table, "help desk" does not
    const parts = t.split(/[\s,/&]+/).filter(Boolean);
    if (parts.length > 1) {
      for (let i = 0; i + 1 < parts.length; i++) vote(parts[i] + ' ' + parts[i + 1], 0.8);
      for (const part of parts) vote(part, 0.5);
    }
  }
  return [...votes.entries()].sort((a, b) => b[1] - a[1]).map(([p]) => p);
}

const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function hits(text, term) {
  const re = new RegExp('(^|[^a-z0-9+#])' + esc(term) + '(?=$|[^a-z0-9])', 'g');
  let n = 0; while (re.exec(text)) n++; return n;
}

export function scoreProject(d, terms) {
  let score = 0; const matched = [];
  const title = d.title.toLowerCase(), skills = d.skills.map(s => s.text).join(' ').toLowerCase(), tech = d.tech.join(' ').toLowerCase();
  const pathWords = (d.pathName + ' ' + d.path).toLowerCase();
  const body = (d.summary + ' ' + d.pitch + ' ' + d.useCase + ' ' + d.steps.map(s => s.title).join(' ')).toLowerCase();
  let primary = false, core = false;
  for (const [t, w] of terms) {
    if (STOP.has(t)) continue;
    let s = 0;
    if (hits(title, t)) s += 3;
    if (hits(skills, t)) s += 2.5;
    if (hits(tech, t)) s += 2.5;
    if (hits(pathWords, t)) s += 1.5;
    // a word the visitor used, in the title, skills, tech or path: the project is about what they asked for
    if (s && w >= 0.7) core = true;
    const b = hits(body, t); if (b) s += Math.min(2, 0.8 * b);
    if (s) { score += s * w; matched.push(t); if (w >= 0.7) primary = true; }
  }
  // A project that only matches widened synonyms, never a word the visitor used, is a weak lead.
  if (!primary) score *= 0.5;
  return { score, matched, core };
}

const LEVEL_RANK = { beginner: 0, intermediate: 1, advanced: 2 };

// The profile the model read out of the conversation, with every field optional.
export function retrieve(projects, profile, opts = {}) {
  const p = profile || {};
  const limit = opts.limit || 12, minScore = opts.minScore == null ? 1.5 : opts.minScore;
  const notes = [];
  const level = LEVEL_RANK[p.level] != null ? p.level : 'any';
  const words = [].concat(p.interests || [], p.skills || [], p.languages || [], p.targetRole ? [p.targetRole] : []).filter(Boolean);
  const terms = expandTerms(words);
  const wantedPaths = (Array.isArray(p.paths) ? p.paths : []).filter(x => PATHS[x]);
  const paths = wantedPaths.length ? wantedPaths : inferPaths(words).slice(0, 2);
  const hours = Number.isFinite(p.hoursAvailable) && p.hoursAvailable > 0 ? p.hoursAvailable : 0;

  // Level is a filter, not a boost: a beginner never sees an advanced-only project unless
  // nothing else fits, and then the reply says so. Intermediate keeps advanced projects as
  // weaker leads; advanced sees everything.
  const allowed = d => level === 'beginner' ? d.level !== 'advanced' : true;
  let pool = projects.filter(allowed);
  let widenedLevel = false;
  const scored = list => list.map(d => { const s = scoreProject(d, terms); return Object.assign({ d }, s); }).filter(x => x.score >= minScore);
  let ranked = scored(pool);
  if (level === 'beginner' && ranked.length < 3) {
    const wider = scored(projects.filter(d => d.level === 'advanced')).filter(x => !ranked.some(y => y.d.id === x.d.id));
    if (wider.length) { widenedLevel = true; pool = projects.slice(); ranked = ranked.concat(wider.map(x => Object.assign(x, { score: x.score * 0.6, aboveLevel: true }))); }
  }
  if (!terms.size) { ranked = []; notes.push('no-interests'); }
  for (const x of ranked) {
    const d = x.d;
    if (paths.length) { if (paths.includes(d.path)) x.score *= paths[0] === d.path ? 1.3 : 1.15; else x.score *= 0.85; }
    if (level === 'intermediate' && d.level === 'advanced') x.score *= 0.8;
    if (level === 'advanced' && d.level === 'beginner') x.score *= 0.85;
    if (level === 'beginner' && d.level === 'beginner') x.score *= 1.1;
    if (hours && d.hours) {
      if (d.hours.min > hours * 1.5) { x.score *= 0.7; x.overTime = true; }
      else if (d.hours.max <= hours) x.score *= 1.1;
    }
  }
  ranked.sort((a, b) => b.score - a.score || LEVEL_RANK[a.d.level] - LEVEL_RANK[b.d.level]);
  const top = ranked.slice(0, limit);
  if (widenedLevel && top.some(x => x.aboveLevel)) notes.push('widened-level');
  if (top.some(x => x.overTime)) notes.push('over-time');

  // What to try instead when little or nothing came back, worked out from the catalog
  // itself. Each one is phrased so a chip can send it back as the visitor's next message.
  const adjustments = [];
  // A strong match names the visitor's field in its title, skills, tech or path and clears
  // the bar; anything else is a lead the page shows only as "closest in the catalog".
  const strong = top.filter(x => x.core && x.score >= STRONG).length;
  if (strong < 3) {
    if (level === 'beginner' && projects.some(d => d.level === 'advanced')) adjustments.push('Include advanced projects too');
    if (hours) adjustments.push('Ignore my time limit');
    const counts = new Map(); for (const d of projects) counts.set(d.path, (counts.get(d.path) || 0) + 1);
    const other = [...counts.entries()].filter(([k]) => !paths.includes(k)).sort((a, b) => b[1] - a[1]).slice(0, 3);
    for (const [k, n] of other.slice(0, 2)) adjustments.push(`Show me the ${PATHS[k]} path (${n} projects)`);
    if (terms.size) adjustments.push('Name a tool you already know, like Python or Excel');
  }
  return {
    candidates: top.map(x => x.d),
    scores: top.map(x => ({ id: x.d.id, score: +x.score.toFixed(2), matched: x.matched, core: !!x.core, aboveLevel: !!x.aboveLevel, overTime: !!x.overTime })),
    level, paths, hours, terms: [...terms.keys()], notes, adjustments, poolSize: pool.length, strong,
  };
}
