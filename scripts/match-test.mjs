// Regression test for the job-matching engine in match.html.
//
// Ranking quality is invisible without this — a change to the catalog or the
// scoring can quietly stop surfacing the right project and nothing complains.
// Each case asserts the path the posting should route to and a project that
// must appear in the recommendations.
//
//   npm run test:match

import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const src = readFileSync(fileURLToPath(new URL('../match.html', import.meta.url)), 'utf8');

// The engine is inline in the page; lift the section between the keyword table
// and rankCerts, which carries PATH_KEYWORDS, PROJECTS, norm, and the rankers.
const start = src.indexOf('const PATH_KEYWORDS');
const end = src.indexOf('function rankCerts');
if (start === -1 || end === -1) throw new Error('match.html: could not locate the match engine');
const engine = new Function(
  src.slice(start, end) + '\nreturn { scorePaths, rankProjects, PROJECTS };'
)();

const CASES = [
  {
    name: 'Junior Data Analyst',
    jd: 'Seeking a Junior Data Analyst. SQL, Excel, Tableau. Build dashboards and reports for marketing stakeholders. Clean data, identify trends.',
    path: 'data',
    // The RFM dashboard, not the Power BI one — this posting asks for Tableau
    // and marketing reporting, which is what da-1 actually builds.
    expect: 'da-1',
  },
  {
    name: 'IT Support Specialist',
    jd: 'IT Support Specialist. Troubleshoot Windows, Active Directory, Office 365. Ticketing via ServiceNow. Image laptops, support VPN, reset passwords.',
    path: 'tech-it',
    expect: 'tech-it-0',   // M365 user management
  },
  {
    name: 'Cloud Engineer',
    jd: 'Cloud Engineer. AWS, Terraform, Kubernetes, CI/CD pipelines. Build infrastructure as code and manage EKS clusters.',
    path: 'cloud',
    expect: 'cl-3',   // Kubernetes / GitOps platform engineering
  },
  {
    name: 'SOC Analyst',
    jd: 'Security Operations Center Analyst. Monitor SIEM alerts, triage incidents, threat hunting, MITRE ATT&CK. Splunk experience preferred.',
    path: 'cyber',
    expect: 'cy-5',   // SIEM detection engineering — the regression that started this
  },
  {
    name: 'Frontend Developer',
    jd: 'Frontend Developer. React, TypeScript, CSS. Build accessible responsive UI components. Work with designers on a design system.',
    path: 'swe',
    expect: 'sw-5',   // accessible component library
  },
  {
    name: 'Data Engineer',
    jd: 'Data Engineer. Build ELT pipelines with dbt and Airflow. SQL modeling, data quality testing, warehouse orchestration.',
    path: 'data',
    expect: 'da-5',   // dbt + Airflow pipeline
  },
  {
    name: 'Help Desk Analyst',
    jd: 'Help Desk Analyst. Tier 1 and Tier 2 support, ticket queues, SLA targets, escalation. Jira Service Management experience a plus.',
    path: 'helpdesk',
    expect: 'hd-6',   // tiered service desk with SLAs
  },
];

let failed = 0;

for (const c of CASES) {
  const { scores } = engine.scorePaths(c.jd);
  const top = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0];
  const recs = engine.rankProjects(top, c.jd, 3);
  const ids = recs.map(r => r.p.id);

  const pathOk = top === c.path;
  const projectOk = ids.includes(c.expect);
  const zeroScore = recs.filter(r => r.score === 0).length;

  if (!pathOk || !projectOk) {
    failed++;
    console.log(`FAIL  ${c.name}`);
    if (!pathOk) console.log(`        path: expected ${c.path}, got ${top}`);
    if (!projectOk) console.log(`        expected ${c.expect} in recommendations, got ${ids.join(', ')}`);
  } else {
    console.log(`ok    ${c.name.padEnd(22)} -> ${top.padEnd(8)} ${recs.map(r => `${r.p.id}[${r.score}]`).join(' ')}`);
  }
  // Not a failure — filler is labelled in the UI — but worth seeing in output.
  if (zeroScore) console.log(`        note: ${zeroScore}/3 recommendations matched no terms`);
}

// Postings with no signal must not produce a confident path.
const { scores: noise } = engine.scorePaths('asdf qwerty zxcvb hjkl foo bar baz nonsense');
const noiseTop = Object.keys(noise).sort((a, b) => noise[b] - noise[a])[0];
if (noise[noiseTop] !== 0) {
  failed++;
  console.log(`FAIL  gibberish scored ${noise[noiseTop]} on ${noiseTop}; it must score 0 so the UI shows its no-match state`);
} else {
  console.log('ok    gibberish control     -> no path signal (UI shows "no clear match")');
}

if (failed) {
  console.error(`\n${failed} case(s) failed.`);
  process.exit(1);
}
console.log(`\nAll ${CASES.length + 1} cases passed.`);
