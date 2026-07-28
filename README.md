# BuildersBench.dev

A curated portfolio project guide for students chasing internships, first roles, and career pivots.

**Live:** [4-projects.vercel.app](https://4-projects.vercel.app)

---

## What's inside

- **43 projects** across 8 career paths — AI Engineer, Cloud, Computer Science, Cybersecurity, Data Analyst, Help Desk, Software Engineer, IT Support
- Each project ships with:
  - A 6-step build roadmap
  - A starter AI prompt for vibe-coding
  - Resume bullets in STAR format
  - A 60-second interview pitch
  - Likely follow-up interview questions
  - Showcase tips for GitHub, LinkedIn, and resumes
- A **free-tier deploy cheatsheet** (Vercel, Railway, Render, Cloudflare Workers, Hugging Face Spaces)
- **Saved / Started / Done** progress tracking (localStorage — stays on your device)
- **Shareable lists** + JSON export/import for backup

## Tech

Single static `index.html`, no framework. Vite bundles the page and the Vercel Analytics module at deploy time.

- Fonts: Inter + JetBrains Mono (self-hosted in `public/fonts/`)
- Hosting + analytics: Vercel
- Icons: Lucide-style line SVGs (inlined)

## Local development

```
npm install
npm run dev
```

Vite serves the site at the printed local URL.

### Adding a project

Every card ships with a video — that's a product requirement, not a nice-to-have. Source the video first, then write the card around it.

Projects live in the `PROJECTS` array in `index.html`, with a trimmed mirror in `match.html` that the job matcher reads. **Both must be updated.** `npm run build` fails if they drift apart, or if any project is missing `youtube` / `ytTitle`.

Where no single tutorial covers a topic, a card can point at a playlist instead:

```js
youtube: 'PLuAoMvvRllpQJUJ2Fn-zwd2zIK9pWjite',
ytPlaylist: true,
ytTitle: 'Jira Service Management Tutorial — Complete Course',
ytThumb: 'dQw4w9WgXcQ',  // optional: a video from the playlist, used as the still image
```

YouTube only serves thumbnails for video ids, so a playlist card without `ytThumb` renders a gradient placeholder instead of a broken image. Both are fine; `ytThumb` just looks better.

To check that every video still resolves and allows embedding (they get deleted and privated over time):

```
npm run check:videos
```

This also runs weekly in CI and on any pull request that touches the catalog, since it needs network access to YouTube that a local sandbox may not have.

### Styles

`index.html` does **not** load `styles.css` — it has its own inline `<style id="glass-terminal-style">` block. `styles.css` serves `match.html`, `certifications.html`, and `prompts.html`.

Shared component styles therefore exist twice, and editing the wrong copy changes nothing with no error. `npm run build` compares the two and fails when a shared selector's declarations diverge. Genuine per-page differences go in `INTENTIONAL_OVERRIDES` in `scripts/styles.mjs` with a reason.

## Security & privacy

- HTTP security headers configured in `vercel.json` (X-Frame-Options, Permissions-Policy, HSTS, etc.)
- All external links use `rel="noopener noreferrer"`
- Email addresses obfuscated and assembled at runtime to prevent scraping
- No backend, no accounts, no PII collected
- Bookmarks and progress live in `localStorage` only — never transmitted
- Third-party requests: YouTube (only when a video thumbnail is clicked), Vercel Analytics

## Credit

Built and maintained by [Job Stats Miami](https://jobstatsmiami.com).
