# BuildersBench.dev

A curated portfolio project guide for students chasing internships, first roles, and career pivots.

**Live:** [4-projects.vercel.app](https://4-projects.vercel.app)

---

## What's inside

- **68 projects** across 8 career paths — AI Engineer, Cloud, Computer Science, Cybersecurity, Data Analyst, Help Desk, Software Engineer, IT Support
- Each project ships with:
  - A 6-step build roadmap, each step with a "done when" bar, a time estimate, and a watch-out
  - A starter AI prompt for vibe-coding
  - Resume bullets in STAR format
  - A "Stuck?" tab: the three to five errors students hit most on that build, each with the fix, plus a fill-in debugging prompt
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

Every project also needs at least three entries in the `STUCK` object that follows the catalog (keyed by project id, each `{ symptom, fix }`); the build fails without them. Generic snags per stack live in `STACK_STUCK` and are appended automatically.

Every roadmap step needs `doneWhen`, `time`, and `watchOut` alongside `title` and `desc`; the build fails without them.

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

### Suggestion form

The "Suggest a project" button opens a form (title, path, level, stack, YouTube
link, why it matters). It posts to `api/suggest.js`, which forwards the
suggestion to the URL in the `SUGGEST_WEBHOOK_URL` environment variable
(Vercel → Settings → Environment Variables). A Slack or Discord incoming
webhook works as-is; any endpoint that accepts JSON gets the fields under
`suggestion`. Until the variable is set the endpoint answers 503 and the form
falls back to a pre-filled email, so nothing is lost.

### Print / save as PDF

Every project modal has a "Print / save PDF" button. It fills `#print-sheet`
with the roadmap (steps with done-when, time and watch-outs, resume bullets,
the interview pitch, follow-up questions, showcase tips) and opens the print
dialog; "Save as PDF" there gives students a handout for advisors.

### Light mode

`public/theme.js` runs as a blocking script in every page's `<head>` and sets
`data-theme` on `<html>`. Dark is the default; light is used only when the
visitor chose it with the header toggle (`localStorage` key `bb-theme`). The
OS preference is ignored so the site always opens in its own look. Light values live in the
`html[data-theme="light"]` block right after `:root` in both stylesheets.

Colours in the stylesheets are written against channel variables so one block
can retheme them: `rgba(var(--w-rgb),0.14)` for the white-alpha glass lines,
`rgba(var(--green-rgb),0.45)` for neon tints, `rgba(var(--bg-rgb),…)` for
translucent chrome, `rgba(var(--well-rgb),…)` for sunken wells, and
`var(--on-accent)` for text on green buttons. Write new styles the same way
rather than with literal `rgba(255,255,255,…)` or `#00FF85`.

### Job matcher

`match.html` maps a pasted job description to a career path, then ranks projects and certs against it. Ranking quality is easy to break without noticing, so it has a regression suite:

```
npm run test:match
```

Each case asserts the path a posting routes to and a project that must appear. Add a case when you add a project that targets a distinct kind of role.

### Talk instead of type

The project search on the home page and the Career Match box each have a mic button.
`public/voice.js` wires up every `.voice-mic` button: the browser's own speech
recognition writes what the visitor says into the field named by `data-voice-for`, and a
status line (`data-voice-note`) says what is happening or what went wrong. Nothing is
submitted for them; they check the words and search or press "Find my plan" themselves.

- The search needs every word to match, so `data-voice-keywords` keeps only the words that
  carry meaning: "show me cloud projects with Python" searches for `cloud python`. The
  filler list is `FILLER` in `voice.js`.
- Career Match takes the whole sentence as spoken.
- Recognition runs in English, or in Spanish when the browser's language is Spanish.
- The button always shows. Where the browser has no speech recognition (Firefox, Chrome on
  iPhone, in-app browsers) a tap says so and suggests Safari, Chrome or Edge.
- `vercel.json` allows `microphone=(self)` for this. In Chrome the recognition may run on
  Google's servers rather than on the device; nothing is sent to BuildersBench.

Career Match also reads a job from its link: `match.html?q=<text>` (or `#q=`) fills the
box and runs the match on load. The Opportunity Board's "Projects for this role" links use
this.

### Styles

`index.html` does **not** load `styles.css` — it has its own inline `<style id="glass-terminal-style">` block. `styles.css` serves `match.html`, `certifications.html`, and `prompts.html`.

Shared component styles therefore exist twice, and editing the wrong copy changes nothing with no error. `npm run build` compares the two and fails when a shared selector's declarations diverge. Genuine per-page differences go in `INTENTIONAL_OVERRIDES` in `scripts/styles.mjs` with a reason.

## Security & privacy

- HTTP security headers configured in `vercel.json` (X-Frame-Options, Permissions-Policy, HSTS, etc.)
- All external links use `rel="noopener noreferrer"`
- Email addresses obfuscated and assembled at runtime to prevent scraping
- No backend, no accounts, no PII collected
- Bookmarks and progress live in `localStorage` only — never transmitted
- Microphone: only when the visitor taps a mic button, and only through the browser's own speech recognition (see "Talk instead of type")
- Third-party requests: YouTube (only when a video thumbnail is clicked), Vercel Analytics

## Credit

Built and maintained by [Job Stats Miami](https://jobstatsmiami.com).
