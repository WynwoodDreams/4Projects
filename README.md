# BuildersBench.dev

A curated portfolio project guide for students chasing internships, first roles, and career pivots.

**Live:** [4-projects.vercel.app](https://4-projects.vercel.app)

---

## What's inside

- **35 projects** across 8 career paths — AI Engineer, Cloud, Computer Science, Cybersecurity, Data Analyst, Help Desk, Software Engineer, IT Support
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

## Security & privacy

- HTTP security headers configured in `vercel.json` (X-Frame-Options, Permissions-Policy, HSTS, etc.)
- All external links use `rel="noopener noreferrer"`
- Email addresses obfuscated and assembled at runtime to prevent scraping
- No backend, no accounts, no PII collected
- Bookmarks and progress live in `localStorage` only — never transmitted
- Third-party requests: YouTube (only when a video thumbnail is clicked), Vercel Analytics

## Credit

Built and maintained by [Job Stats Miami](https://jobstatsmiami.com).
