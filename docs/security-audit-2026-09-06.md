# Security Audit — BuildersBench (4Projects)

Date: 2026-09-06
Scope: GitHub repo `WynwoodDreams/4Projects` (all branches, full history), Vercel project `4-projects-b`, dependencies, and GitHub CI.

## Verdict

No evidence of a breach, prompt injection, malware, or data extraction was found.

## What was checked

- Every tracked file and every commit on every branch (118 on main, plus 5 stale branches).
- Invisible Unicode (zero-width, bidi overrides), hidden HTML/CSS text, HTML comments, inline event handlers, `javascript:` URLs.
- Prompt-injection phrasing in code, docs, the Claude skill file, README, commit messages, PR titles, and issues.
- Dangerous JS (`eval`, `new Function`, `atob`, `innerHTML`, `fetch`, beacons, websockets) and every external host referenced.
- All 78 npm packages: registry source, integrity hashes, known advisories.
- Git object integrity (`fsck`), orphan roots, deleted files, direct pushes to main, unmerged branches.
- GitHub collaborators, PRs (53), issues (0), Actions runs (9).
- Vercel deployments (last 20), deployment protection, runtime errors, custom domains.
- Secret patterns (API keys, tokens, private keys) across full history.

## Findings

### 1. No injected code or content
- Every script that ships to visitors is in this repo. The only third-party script is Vercel Analytics, pulled from `registry.npmjs.org` with an integrity hash.
- No hidden Unicode, hidden elements, or AI-directed instructions anywhere. The `.claude/skills/glass-terminal/SKILL.md` file contains only design rules.
- All "suspicious" keyword hits (`password`, `webhook`, `system prompt`, `exfiltration`) are legitimate text inside the IT/security project descriptions the site publishes.
- The `Content-Security-Policy` in `vercel.json` restricts scripts to the site itself and Vercel, frames to `youtube-nocookie.com`, and connections to Vercel Insights. This blocks most classes of injected script from running even if one appeared.

### 2. Who has written to this repo
| Author | Commits | What |
|---|---|---|
| Christian Ortega (owner) | 47 merges + 3 April edits | All PR merges |
| Claude (owner's sessions) | 69+ | All feature work, via PRs |
| Vercel bot | 1 (PR #18) | Added `@vercel/analytics`, `package.json`, `analytics.js`. Verified benign. |
| Manus AI (`manus@manus.im`) | 3 | 2026-04-16: edited 21 YouTube links. 2026-05-06: added 270 lines of project JSON **directly to main, no PR**. |

The Manus AI content is plain data (project titles, summaries, skills). It contains no URLs, scripts, or hidden text, and it is still live in the catalog today. Purpose: content generation. Outcome: none beyond the catalog entries. Only one collaborator (the owner) exists on the repo, so Manus wrote through the owner's account or an installed GitHub App.

### 3. History was reset on 2026-05-05
`main` starts at commit `0174f1e` (May 5) and shares **no ancestor** with the April history, which survives only on the stale branches `claude/remove-mdc-entec-lMQle`, `claude/customize-card-colors-Ij27g`, and `claude/redesign-layout-typography-LNapU`. A second orphan root (`c00a4cf`, May 6) was merged in via PR #7. Nothing in the reset looks malicious, but it means `main` alone cannot prove what the site contained before May 5, and it was only possible because `main` has no branch protection.

### 4. Three commits bypassed pull-request review
`0174f1e`, `e75ffaa` (Claude, May 5) and `51ecccc` (Manus AI, May 6) were pushed straight to `main`. Everything after May 6 went through a PR.

### 5. Vercel
- All 20 most recent deployments were built from GitHub commits pushed by the owner's account. No manual or CLI uploads.
- Production is commit `790eff0`, the current head of `main`.
- Preview deployments require Vercel SSO. Custom domains (`buildersbench.dev`, `www.buildersbench.dev`) are public, as intended.
- No serverless functions, so no runtime logs or errors exist.
- **Web Analytics is not enabled** on the project (API returns "not found"), even though every page loads `analytics.js`. No visitor data is being collected, and there is no traffic log to review for probe attempts.

### 6. Dependencies
`npm audit` reports 3 high advisories, all in **build-time-only** tools that never ship to visitors: `vite` 6.4.2, `postcss`, `nanoid`. They only matter on the machine running `npm run build`.

### 7. User-input surfaces (reviewed, clean)
- Shared-list URLs (`#list=`) and JSON imports are filtered against the known project ID list before use.
- Career Match escapes all pasted text before rendering.
- YouTube embed IDs are validated at build time (11-character video IDs, playlist prefixes).
- Storage is browser `localStorage` only. No backend, no cookies, no personal data collected.

### 8. Not security, but noted
- The weekly "Check videos" workflow failed on Aug 24 and Aug 31. A YouTube video in the catalog has likely been removed or made private.
- A Supabase project (`Emnova-Prjoect`) exists in the same account but is not referenced by this site.

### Limitation
The sandbox blocked outbound requests to `4-projects.vercel.app` and `buildersbench.dev`, so the live HTML could not be diffed byte-for-byte against the repo. Vercel's deployment metadata confirms production was built from `main` at `790eff0`, which was audited in full.

## Suggestions

1. **Protect `main`**: require pull requests, block force-pushes and direct pushes. (GitHub → Settings → Branches)
2. **Review installed apps**: GitHub → Settings → Applications. Remove Manus AI if it is no longer used. Do the same for any OAuth apps you don't recognise.
3. **Decide on analytics**: either enable Web Analytics in the Vercel dashboard, or delete `analytics.js` and its script tag and drop the Vercel hosts from the CSP.
4. **Update build tools**: `npm update vite` and add `npm audit --audit-level=high` to the Tests workflow.
5. **Clean up branches**: delete the 5 stale branches, or tag the April history first if you want to keep it.
6. **Turn on GitHub secret scanning and Dependabot alerts** (Settings → Code security). No secrets were found in history, so this is prevention only.
7. **Optional hardening**: move the inline `<script>` blocks into files so `'unsafe-inline'` can be removed from the CSP.
