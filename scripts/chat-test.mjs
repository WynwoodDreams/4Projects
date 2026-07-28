// Regression test for the guide chatbot's intent matching.
//
// The bot is only as good as its keyword coverage, and a knowledge-base edit
// can silently stop a common question from matching. Each case asserts the
// intent a real phrasing should land on; the last group asserts questions the
// bot must NOT pretend to answer.
//
//   npm run test:chat

import { matchIntent, INTENTS } from '../chatbot.js';

const CASES = [
  // Site questions
  ['what is this site?', 'what-is-this'],
  ['is this free to use', 'free'],
  ['do I need an account', 'free'],
  ['which career path should I choose', 'career-paths'],
  ['how does the job match work', 'match-page'],
  ['how do I track my progress', 'progress-tracking'],
  ['can I backup my saved projects to another device', 'export-share'],
  ['how long does an advanced project take', 'levels-time'],
  ['do the projects have videos', 'videos'],
  ['are the certifications really free', 'certs'],
  ['where is the prompt library', 'prompts'],
  ['how do I deploy my project for free', 'deploy'],
  ['do you collect my data', 'privacy'],
  ['who made this site', 'who-built'],
  // Career advice
  ['how do I write resume bullets for a project', 'resume-bullets'],
  ['how do I talk about my project in an interview', 'interview-pitch'],
  ['what should my github readme look like', 'github-tips'],
  ['how many projects do I need in my portfolio', 'how-many-projects'],
  ['how do I get a job with no experience', 'no-experience'],
  ['do I need a cover letter', 'cover-letter'],
  ['im new, where do I start', 'which-first'],
  ['I want to land an internship', 'no-experience'],
];

// Out-of-scope questions must fall through to the fallback, not get a
// confidently wrong canned answer.
const MUST_NOT_MATCH = [
  'what is the weather today',
  'write me a python script',
  'who won the game last night',
  'asdf qwerty zxcvb',
];

let failed = 0;

for (const [q, expected] of CASES) {
  const hit = matchIntent(q);
  if (hit?.id !== expected) {
    failed++;
    console.log(`FAIL  "${q}"\n        expected ${expected}, got ${hit ? hit.id : 'fallback'}`);
  } else {
    console.log(`ok    "${q}" -> ${hit.id}`);
  }
}

for (const q of MUST_NOT_MATCH) {
  const hit = matchIntent(q);
  if (hit) {
    failed++;
    console.log(`FAIL  "${q}" should hit the fallback, got ${hit.id}`);
  } else {
    console.log(`ok    "${q}" -> fallback`);
  }
}

// Every chip offered anywhere must itself resolve to an intent — a chip that
// lands on the fallback is a dead end the bot itself suggested.
const chips = new Set(INTENTS.flatMap(i => i.chips || []));
for (const c of chips) {
  if (!matchIntent(c)) {
    failed++;
    console.log(`FAIL  chip "${c}" does not match any intent`);
  }
}
console.log(`ok    all ${chips.size} intent chips resolve`);

if (failed) {
  console.error(`\n${failed} case(s) failed.`);
  process.exit(1);
}
console.log(`\nAll ${CASES.length + MUST_NOT_MATCH.length} cases passed.`);
