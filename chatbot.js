// BuildersBench guide bot — a scripted, fully client-side chat widget.
//
// This is intent matching over a hand-written knowledge base, not an LLM.
// Nothing leaves the browser: no API calls, no storage, the transcript dies
// with the tab. The widget injects its own markup and styles so all four
// pages get it from this one file, without adding a third copy of shared CSS.
//
// respond() is async and returns { text, links, chips } so a real model
// behind a serverless endpoint can replace the lookup later without touching
// the UI code.

// ===== KNOWLEDGE BASE =====
// keywords: single words score 1, phrases score 2. First intent past the
// threshold with the highest score wins.
export const INTENTS = [
  {
    id: 'what-is-this',
    keywords: ['what is this', 'what is buildersbench', 'about this site', 'what does this site', 'who is this for', 'how does this work', 'purpose', 'about'],
    text: 'BuildersBench is a portfolio project guide for people chasing internships, first roles, and career pivots. 43 projects across 8 career paths — each with a 6-step build roadmap, a starter AI prompt, resume bullets, an interview pitch, and a video tutorial to follow.',
    links: [['Browse the projects', '/index.html']],
    chips: ['Which career path fits me?', 'How do I track progress?', 'Is it free?'],
  },
  {
    id: 'free',
    keywords: ['is it free', 'cost', 'price', 'pay', 'paid', 'subscription', 'sign up', 'account', 'free'],
    text: 'Everything here is free — no account, no sign-up, no paywall. The certifications page also only lists programs that are free to start. Your progress is saved in your own browser, not on our servers.',
    links: [['Free certifications', '/certifications.html']],
  },
  {
    id: 'career-paths',
    keywords: ['career path', 'which path', 'career paths', 'paths', 'tracks', 'choose a path', 'which career', 'what career', 'right path', 'fits me'],
    text: 'There are 8 paths: AI Engineer, Cloud, Computer Science, Cybersecurity, Data Analyst, Help Desk, Software Engineer, and IT Support. Not sure which fits? Paste a real job posting into the match page and it will route you to the closest path, with projects and certs to go with it.',
    links: [['Match me to a job', '/match.html'], ['See all paths', '/index.html']],
  },
  {
    id: 'match-page',
    keywords: ['match', 'job description', 'job posting', 'paste a job', 'match me', 'job match', 'career match', 'which projects for'],
    text: 'The match page takes a job title or a full job description, figures out which career path it maps to, and hands you the exact projects to build and free certs to earn for it. It is a transparent keyword match over the catalog — paste the real posting for best results.',
    links: [['Open the match page', '/match.html']],
  },
  {
    id: 'progress-tracking',
    keywords: ['track progress', 'track my progress', 'my progress', 'progress', 'track', 'saved', 'started', 'done', 'bookmark', 'save projects', 'my projects', 'continue', 'where i left off', 'localstorage', 'local storage'],
    text: 'Every project card has Saved / Started / Done states, and each roadmap step can be checked off individually. It all lives in your browser\'s localStorage — nothing is sent anywhere, which also means it stays on this device unless you use the JSON export to back it up or move it.',
    links: [['Go to the projects', '/index.html']],
  },
  {
    id: 'export-share',
    keywords: ['export', 'import', 'backup', 'back up', 'share list', 'shareable', 'share my', 'another device', 'transfer'],
    text: 'From the projects page you can export your progress as a JSON file for backup, import it on another device, and create shareable links for lists of projects. Since everything is stored locally, the export is the only copy that exists outside your browser.',
    links: [['Projects page', '/index.html']],
  },
  {
    id: 'levels-time',
    keywords: ['how long', 'time', 'hours', 'beginner', 'intermediate', 'advanced', 'difficulty', 'levels', 'easy', 'hardest', 'weekend'],
    text: 'Projects come in three levels: Beginner (a weekend, 6–10 hrs), Intermediate (1–2 weeks, 15–25 hrs), and Advanced (3–4 weeks, 40–60 hrs). Filter by level on the projects page. If you are new, start with one beginner project and finish it — a finished small project beats an abandoned big one every time.',
    links: [['Browse by level', '/index.html']],
  },
  {
    id: 'videos',
    keywords: ['video', 'videos', 'youtube', 'tutorial', 'watch', 'follow along', 'playlist'],
    text: 'Every project ships with a video — a step-by-step build or a full course playlist — chosen before the project was added, so you are never left with just a wall of text. Open any project card and look for the Watch & Learn section.',
    links: [['Open a project', '/index.html']],
  },
  {
    id: 'certs',
    keywords: ['certification', 'certifications', 'certs', 'certificate', 'credential', 'google cert', 'free courses', 'courses'],
    text: 'The certifications page lists free, official programs from the organizations building the field — hands-on courses and credentials you can put on your resume and LinkedIn. Pair one cert with one built project from the same path: the cert says you studied it, the project proves you can do it.',
    links: [['Free certifications', '/certifications.html']],
  },
  {
    id: 'prompts',
    keywords: ['prompt', 'prompts', 'prompt library', 'ai prompt', 'vibe coding', 'vibe-coding', 'starter prompt'],
    text: 'The prompt library has ready-to-use AI prompts for building your portfolio — planning a project, debugging, writing your README, prepping for interviews. Every project card also carries its own starter prompt tuned to that specific build.',
    links: [['Prompt library', '/prompts.html']],
  },
  {
    id: 'deploy',
    keywords: ['deploy', 'deploy my project', 'deployment', 'hosting', 'host my project', 'vercel', 'railway', 'render', 'cloudflare', 'free tier', 'put it online', 'live demo'],
    text: 'The projects page includes a free-tier deploy cheatsheet covering Vercel, Railway, Render, Cloudflare Workers, and Hugging Face Spaces. A live URL matters: a recruiter will click a link, but they will rarely clone a repo. Deploy even the small stuff.',
    links: [['Deploy cheatsheet', '/index.html']],
  },
  // ===== CAREER ADVICE =====
  {
    id: 'resume-bullets',
    keywords: ['resume', 'resume bullet', 'resume bullets', 'cv', 'star format', 'star method', 'work experience section', 'what to put on'],
    text: 'Write project bullets in STAR shape: what situation, what you built, how, and the measurable result — "Built an automated ticket classifier (Python, OpenAI API) that categorized 50 test tickets with 90% accuracy, cutting triage time from 5 minutes to seconds." Every project here includes ready-made STAR bullets you can adapt. List projects in their own section above education if you lack work experience.',
    links: [['Projects with resume bullets', '/index.html']],
  },
  {
    id: 'interview-pitch',
    keywords: ['interview', 'interview pitch', 'talk about my project', 'tell me about yourself', 'behavioral', 'follow up questions', 'follow-up questions', '60 second', 'explain my project'],
    text: 'For each project, be ready with a 60-second pitch: the problem, your approach, one hard thing you hit and how you solved it, and the result. Interviewers probe the hard-thing part — that is where they learn whether you built it or copied it. Every project card here includes a pitch and the follow-up questions you are likely to get.',
    links: [['See a project\'s pitch', '/index.html']],
  },
  {
    id: 'github-tips',
    keywords: ['github', 'readme', 'repo', 'repository', 'portfolio site', 'showcase', 'linkedin post'],
    text: 'Three things make a repo land: a README that opens with what it does and a screenshot or GIF (not installation steps), a live demo link if there is any way to host it, and honest documentation of what you would improve. On LinkedIn, a 60-second screen recording of the thing working outperforms any text post. Each project card has showcase tips for GitHub, LinkedIn, and your resume.',
    links: [['Showcase tips per project', '/index.html']],
  },
  {
    id: 'how-many-projects',
    keywords: ['how many projects', 'enough projects', 'how many do i need', 'number of projects', 'portfolio size'],
    text: 'Two or three finished, deployed, well-documented projects beat ten half-done ones. A good target: one beginner project to get moving, one intermediate that matches the jobs you want, and one you can talk about for ten minutes straight. Depth wins interviews, not volume.',
    links: [['Pick your projects', '/index.html']],
  },
  {
    id: 'no-experience',
    keywords: ['no experience', 'entry level', 'entry-level', 'first job', 'career change', 'career pivot', 'pivot', 'get hired', 'break into', 'internship', 'internships', 'new grad'],
    text: 'Without work experience, your projects are your experience — treat them that way. Build things shaped like the job you want (paste real postings into the match page to find them), deploy them, and write about them in STAR bullets. Pair that with one or two free certs from the same path. Then apply broadly: entry-level hiring rewards volume plus a portfolio that survives a click.',
    links: [['Match a real job posting', '/match.html'], ['Free certifications', '/certifications.html']],
  },
  {
    id: 'cover-letter',
    keywords: ['cover letter', 'cover letters', 'application', 'apply', 'applying'],
    text: 'Keep cover letters short and specific: one line on why this company, one paragraph connecting your strongest project to their stack, one close. Mentioning a deployed project with a link beats any adjective. Skip it entirely when optional and the posting is high-volume — put that time into the portfolio instead.',
  },
  {
    id: 'which-first',
    keywords: ['where do i start', 'which project first', 'start with', 'getting started', 'begin', 'first project', 'im new', "i'm new", 'overwhelmed'],
    text: 'Start with one beginner project from the path you are aiming at — they are scoped to a weekend so you actually finish. Finishing is the skill: deploy it, write the README, then move up a level. If you do not know your path yet, paste a job you would want into the match page and let it pick your starting point.',
    links: [['Beginner projects', '/index.html'], ['Find your path', '/match.html']],
  },
  {
    id: 'privacy',
    keywords: ['privacy', 'data', 'tracking', 'collect', 'cookies', 'analytics', 'pii'],
    text: 'No backend, no accounts, no PII collected. Progress and bookmarks live in your browser\'s localStorage and are never transmitted. Third-party requests only happen for Vercel Analytics and YouTube (and only when you click a video). This chat is scripted and runs entirely in your browser too — nothing you type here is sent anywhere.',
  },
  {
    id: 'who-built',
    keywords: ['who built', 'who made', 'creator', 'author', 'contact', 'feedback', 'job stats miami'],
    text: 'BuildersBench is built and maintained by Job Stats Miami. Feedback is welcome — there is a contact link in the site footer.',
  },
];

export const FALLBACK = {
  id: 'fallback',
  text: 'I\'m a scripted guide, not a full AI — I can answer questions about this site and basic career-services topics, but that one is outside what I know. Try one of these, or rephrase with a keyword like "resume", "certs", or "deploy".',
  chips: ['What is BuildersBench?', 'Which career path fits me?', 'How do I write resume bullets?', 'Where do I start?'],
};

const GREETING = {
  text: 'Hi! I\'m the BuildersBench guide — a scripted helper (no AI, nothing you type leaves your browser). Ask me about the site or basic career questions.',
  chips: ['What is BuildersBench?', 'Where do I start?', 'How many projects do I need?', 'Is it free?'],
};

// ===== MATCHING =====
function norm(s) {
  return ' ' + String(s).toLowerCase().replace(/[^a-z0-9+#./' -]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
}
function variants(term) {
  return term.endsWith('s') ? [term, term.slice(0, -1)] : [term, term + 's'];
}

export function matchIntent(text) {
  const t = norm(text);
  let best = null, bestScore = 0;
  for (const intent of INTENTS) {
    let score = 0;
    for (const kw of intent.keywords) {
      const phrase = kw.includes(' ');
      if (variants(kw).some(v => phrase ? t.includes(v) : t.includes(` ${v} `))) {
        score += phrase ? 2 : 1;
      }
    }
    if (score > bestScore) { bestScore = score; best = intent; }
  }
  // One weak single-word hit is not enough to answer confidently — a phrase
  // match or two independent hits is.
  return bestScore >= 2 ? best : (bestScore === 1 && best ? best : null);
}

export async function respond(text) {
  const intent = matchIntent(text);
  return intent || FALLBACK;
}

// ===== UI =====
const CSS = `
.bb-chat-launcher {
  position: fixed; bottom: 22px; right: 22px; z-index: 9000;
  width: 54px; height: 54px; border-radius: 50%; cursor: pointer;
  border: 1px solid rgba(0,255,133,0.45);
  background: linear-gradient(180deg, #06231a 0%, #04140f 100%);
  color: var(--green, #00ff85);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 18px rgba(0,255,133,0.25), 0 10px 26px rgba(0,0,0,0.5);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.bb-chat-launcher:hover { transform: translateY(-2px); box-shadow: 0 0 26px rgba(0,255,133,0.4), 0 14px 30px rgba(0,0,0,0.55); }
.bb-chat-launcher svg { width: 24px; height: 24px; }
.bb-chat-panel {
  position: fixed; bottom: 90px; right: 22px; z-index: 9001;
  width: min(370px, calc(100vw - 32px));
  height: min(520px, calc(100vh - 120px));
  display: flex; flex-direction: column; overflow: hidden;
  border-radius: 14px; border: 1px solid rgba(0,255,133,0.28);
  background: rgba(4, 18, 13, 0.96);
  backdrop-filter: blur(12px);
  box-shadow: 0 0 0 1px rgba(0,0,0,0.4), 0 24px 60px rgba(0,0,0,0.6), 0 0 30px rgba(0,255,133,0.12);
  font-family: 'Inter', system-ui, sans-serif;
}
.bb-chat-panel[hidden] { display: none; }
.bb-chat-head {
  display: flex; align-items: center; gap: 10px; padding: 13px 16px;
  border-bottom: 1px solid rgba(0,255,133,0.18);
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  letter-spacing: 0.16em; text-transform: uppercase; color: var(--green, #00ff85);
}
.bb-chat-head .bb-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green, #00ff85); box-shadow: 0 0 8px rgba(0,255,133,0.8); }
.bb-chat-close {
  margin-left: auto; background: none; border: none; cursor: pointer;
  color: rgba(230,241,243,0.6); font-size: 18px; line-height: 1; padding: 4px;
}
.bb-chat-close:hover { color: var(--green, #00ff85); }
.bb-chat-log { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.bb-msg { max-width: 88%; padding: 10px 13px; border-radius: 11px; font-size: 13.5px; line-height: 1.55; color: #e6f1f3; }
.bb-msg-bot { align-self: flex-start; background: rgba(0,255,133,0.07); border: 1px solid rgba(0,255,133,0.16); border-bottom-left-radius: 3px; }
.bb-msg-user { align-self: flex-end; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-bottom-right-radius: 3px; }
.bb-msg-links { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 9px; }
.bb-msg-links a {
  font-family: 'JetBrains Mono', monospace; font-size: 10.5px; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--green, #00ff85); text-decoration: none;
  padding: 4px 10px; border: 1px solid rgba(0,255,133,0.35); border-radius: 999px;
}
.bb-msg-links a:hover { background: rgba(0,255,133,0.1); }
.bb-chat-chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 16px 10px; }
.bb-chip {
  cursor: pointer; font-size: 12px; color: #b8c7ca;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.14);
  border-radius: 999px; padding: 5px 12px;
}
.bb-chip:hover { color: var(--green, #00ff85); border-color: rgba(0,255,133,0.45); }
.bb-chat-form { display: flex; gap: 8px; padding: 12px 14px; border-top: 1px solid rgba(0,255,133,0.18); }
.bb-chat-input {
  flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.14);
  border-radius: 9px; padding: 9px 12px; color: #e6f1f3; font-size: 13.5px; font-family: inherit;
}
.bb-chat-input:focus { outline: none; border-color: rgba(0,255,133,0.5); box-shadow: 0 0 0 1px rgba(0,255,133,0.3); }
.bb-chat-send {
  cursor: pointer; border: none; border-radius: 9px; padding: 0 14px;
  font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.12em;
  text-transform: uppercase; font-weight: 700; color: #02110a;
  background: linear-gradient(180deg, var(--green, #00ff85) 0%, #00cc6a 100%);
}
@media (max-width: 480px) {
  .bb-chat-panel { right: 16px; bottom: 84px; }
  .bb-chat-launcher { bottom: 16px; right: 16px; }
}
`;

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text) n.textContent = text;
  return n;
}

function initUI() {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  const launcher = el('button', 'bb-chat-launcher');
  launcher.setAttribute('aria-label', 'Open the BuildersBench guide chat');
  launcher.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>';

  const panel = el('div', 'bb-chat-panel');
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'BuildersBench guide chat');
  panel.innerHTML = `
    <div class="bb-chat-head"><span class="bb-dot"></span>Guide · scripted, on-device
      <button class="bb-chat-close" aria-label="Close chat">×</button></div>
    <div class="bb-chat-log" aria-live="polite"></div>
    <div class="bb-chat-chips"></div>
    <form class="bb-chat-form">
      <input class="bb-chat-input" type="text" placeholder="Ask about the site or your job hunt…" aria-label="Your question" maxlength="300" />
      <button class="bb-chat-send" type="submit">Ask</button>
    </form>`;

  document.body.append(launcher, panel);

  const log = panel.querySelector('.bb-chat-log');
  const chipsRow = panel.querySelector('.bb-chat-chips');
  const input = panel.querySelector('.bb-chat-input');
  const form = panel.querySelector('.bb-chat-form');

  function addBot({ text, links, chips }) {
    const m = el('div', 'bb-msg bb-msg-bot', text);
    if (links && links.length) {
      const row = el('div', 'bb-msg-links');
      links.forEach(([label, href]) => {
        const a = el('a', '', label + ' →');
        a.href = href;
        row.appendChild(a);
      });
      m.appendChild(row);
    }
    log.appendChild(m);
    setChips(chips || []);
    log.scrollTop = log.scrollHeight;
  }

  function setChips(chips) {
    chipsRow.textContent = '';
    chips.forEach(c => {
      const b = el('button', 'bb-chip', c);
      b.type = 'button';
      b.onclick = () => ask(c);
      chipsRow.appendChild(b);
    });
  }

  async function ask(q) {
    log.appendChild(el('div', 'bb-msg bb-msg-user', q));
    log.scrollTop = log.scrollHeight;
    setChips([]);
    const answer = await respond(q);
    addBot(answer);
    window.bbTrack && window.bbTrack('chat_question', { intent: answer.id });
  }

  let greeted = false;
  function open() {
    panel.hidden = false;
    if (!greeted) { addBot(GREETING); greeted = true; }
    input.focus();
    window.bbTrack && window.bbTrack('chat_open', {});
  }
  function close() {
    panel.hidden = true;
    launcher.focus();
  }

  launcher.onclick = () => (panel.hidden ? open() : close());
  panel.querySelector('.bb-chat-close').onclick = close;
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) close(); });
  form.onsubmit = e => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    ask(q);
  };
}

// Skip UI setup when imported outside a browser (the test suite does this).
if (typeof document !== 'undefined' && document.body) {
  initUI();
} else if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initUI);
}
