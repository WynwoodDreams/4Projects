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
- A **peek** on every card: four tabs under the title (Overview, Video, Roadmap, Stuck?) flip
  the card face so a visitor can size up a project without opening it. Hovering or tapping a
  tab picks a face; while the pointer rests on a card it cycles through all four (1.4s each) and
  stops when the pointer leaves. Nothing moves on its own otherwise, and nothing moves under
  "reduce motion". `peekHTML`, `setPeek` and `wirePeek` in `index.html`.
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

Projects live in the `PROJECTS` array in `index.html`, with a trimmed mirror in `match.html` that the job matcher reads. **Both must be updated.** Scout (`lib/assistant/`) reads the `index.html` copy at run time; bump the `catalog-updated` meta in its `<head>` so the agent's readout shows the new date. `npm run build` fails if they drift apart, or if any project is missing `youtube` / `ytTitle`.

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
`html[data-theme="light"]` block right after `:root` in both stylesheets. The light palette is
"Terracotta" (since 2026-11-01): sun-baked clay and peach surfaces, burnt-orange buttons and
highlights, espresso text, no white anywhere. `public/theme.js` sets the matching browser-chrome
colour (`theme-color`). Every text pair clears WCAG AA; re-check if you change `--green` or `--bg`.

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

## Scout, the projects agent (beta)

`assistant.html` is the projects page's agent, linked from the header pill "Scout" (badged
Beta on the page) and the footer: a visitor says or types the role they want and what they can
already do, or pastes a job posting, and Scout recommends up to five projects from the catalog,
says why each one fits, and names the skills the role asks for that the student has not
mentioned. It only knows this site's catalog. Asked for a cover letter, the weather or
homework, it says in one line that it only knows this site's projects, then offers what it can
do: recommend projects, read what a project builds, or point to Christian's Opportunity Board
for listings and to ResumeCanvas for the résumé. It is the one part of the site that is not
static apart from the suggestion form and the premium page. `api/assistant.js` is a Vercel
function; everything it does is in `lib/assistant/`, the same shape as COB's assistant so
the two can share a gateway and a set of variables.

How a turn works (`lib/assistant/handler.js`):

1. **Read.** The model turns the conversation into a profile (interests, skills, programming
   languages, target role, catalog paths, level, experience, hours available) and an intent:
   a search, a question about the projects it already showed, or something else. If the
   profile names neither a field nor a role nor a skill it may ask one short question, at
   most three per conversation (`maxFollowups`); the server counts them and stops asking.
2. **Retrieve, deterministically.** `retrieve.js` turns the profile into filters and a
   keyword score over the catalog's own projects: title, skills, tech and path count most,
   the summary and roadmap less. Interests are widened with `SYNONYMS` ("cybersecurity" also
   finds SOC, threat, GRC, SIEM) and the same table names the career path to rank first.
   Level is a filter: a beginner never sees an advanced-only project unless fewer than three
   others fit, and then the reply says so and the card is flagged. The hours a visitor named
   are a discount, not a filter. The top 12 go to the model; a project not among them cannot
   be recommended.
3. **Rank and explain.** The model orders those candidates, writes one or two sentences on the
   fit, and names the gaps as *indexes* into the project's own `skills` list (the catalog's
   comma-separated string, split the same way everywhere), never as free text. The server
   checks every id and index before anything reaches the page.
4. **Answer.** A question about the recommended projects is answered from their catalog text
   only (summary, skills, tech, roadmap step titles and times, why it matters), passed as
   data.

The response kinds: `question` (one follow-up), `results` (summary, matches with `why` and
`gaps`, the `filters` that were applied, `adjustments`), `nomatch` (summary, adjustments
worked out from the catalog, up to three closest projects marked weak), `answer` (about the
shown projects) and `reply` (anything else, including the off-topic refusal). Every reply
carries `source` (`catalog` or `sample`), `model` and `updated`.

Catalog text reaches the model inside a JSON `data` field and every prompt says it is data,
never an instruction; a pasted posting is treated the same way. The page renders cards from
the server's copy of the project (id, title, path, level, hours, tech, skills, the site's own
`#project=` link), so a model reply can add an explanation but cannot change what a card says
or links to. Every card says the project is from this site's catalog and the fit was
AI-picked.

**When the model fails, the visitor still gets projects.** An empty reply is retried once
with twice the `max_tokens`. If the intake or ranking call still fails for any reason (empty
reply, timeout, bad JSON, rate limit, no credit, bad credentials, a provider outside the
list), the handler reads the visitor's own words with `keywordRead` (field words, level,
hours) and runs the same deterministic search. The reply is an ordinary `results` or
`nomatch` with `fallback: true` and no "why it fits"; it never mentions the model. Every
fallback is written to the function log with `console.warn` (`[assistant] intake failed...`).
The page itself never shows a server error's text: a 5xx reads "That one did not go through."
with Try again and a link that searches the site for what they asked (`/#q=<text>` fills the
project search).

**The page: a stage, not a chat.** No message list. The top bar carries a mono readout (the
agent's name, how many projects it knows, its live state, the catalog's `catalog-updated`
date from `index.html`, a Beta badge), "Talking with [name] · change · Start over" and a
speaker button. The presence is an orb in the site's green: its rings ripple outward while it
speaks, pull inward while it listens, and its core bars blink while it thinks; the radial glow
behind it brightens with the voice. Beside it: the visitor's last message, the reply in display
type with key numbers in the accent, a waveform, a one-line follow-up and chips (the server's
adjustments, which send themselves; on an error, Try again and Search the site instead). Under
that a "Searched with" strip of the filters the server actually applied, then the picks as a
filmstrip of cards that rise in one after another and scroll sideways; the closest fit is
outlined. Each card: a label (Closest fit / Pick #n / Weak match), title, path, level and
hours, tags, "Why it fits" clamped to three lines, a folded "What it asks for" with the gaps
counted and marked, Open project, and the honesty line. The strip header has the pick count, a
"Conversation (n turns)" popover and "Open on the site". One floating bar holds the text box,
the mic and Send. Under 760 px the presence is a compact row pinned at the top, the cards stack
and scroll under it with nothing clamped, and the bar is fixed at the bottom with Send
collapsed to its icon.

**Talking.** Every reply is read aloud with the browser's own speech synthesis (an English
voice, rate 1.02); nothing is spoken until the visitor has sent something, so the page never
talks on load. The speaker button mutes it and the choice is remembered (`localStorage`
`bb.scout.muted`). Voice in is the browser's own speech recognition, in English or in Spanish
when the browser's language is Spanish, one phrase at a time: the recogniser stops itself
when the visitor pauses and what it heard is sent right then, with no tap on Send. The mic
button always shows; where the browser has none a tap says so and suggests typing. Turn-taking
is hands-free: the mic is stopped before Scout says a word, so it never records its own voice,
and if the visitor's last message was spoken the mic opens again about 350 ms after the reply
finishes. Silence ends the loop with "Tap the mic to talk again"; typing ends it; tapping the
mic while it listens ends it and throws away the half-heard words; Start over ends it. With
the voice muted Scout listens right after the reply shows. Some browsers never fire the end of
a cancelled utterance, so a 1.5 s check keeps the exchange from hanging. The microphone is
allowed through `Permissions-Policy` in `vercel.json` (site-wide, since the project search and
Career Match have mic buttons too). In Chrome the recognition may run on Google's servers
rather than on the device; Scout itself only ever receives the text.

**The beta gate.** Before the chat opens, the page asks for a name and an email. The server
checks them on every turn (`visitor: {name, email}` in the POST body; a missing or bad one is
a `400` with `code: "who"`, which makes the page show the form again), so the form cannot be
skipped by calling the API directly. The pair is kept in the visitor's browser
(`localStorage`, key `bb.visitor`) so a return visit is not asked twice; "change" in the top
bar clears it. Each new conversation writes one line to the function log, `[assistant]
visitor {"name","email","at","asked"}`, and, when `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` are set, one row to the Supabase table `bb_assistant_visitors`
(`lib/assistant/visitors.js`), the same project that holds COB's `cob_assistant_visitors`.
Create it once:

```sql
create table public.bb_assistant_visitors (
  id bigint generated always as identity primary key,
  name text not null, email text not null, asked text, at timestamptz not null default now()
);
alter table public.bb_assistant_visitors enable row level security;
```

No policies: only the service key (server-side) can write or read it. A failed insert is
warned about in the log and the visitor still gets their answer. `ASSISTANT_GATE=off` turns
the requirement off; `GET /api/assistant` reports `gate` and `visitorStore`.

**The model.** Requests go through Vercel AI Gateway's OpenAI-compatible endpoint
(`https://ai-gateway.vercel.sh/v1/chat/completions`), model `minimax/minimax-m3.1-flash`,
with `providerOptions.gateway.only: ["minimax"]` so the gateway serves the request from
MiniMax or fails it. `ASSISTANT_MODEL` and `ASSISTANT_PROVIDERS` switch both without a code
change; a reply served by a provider outside the list is refused.

**Setup.** `.env.example` lists every variable. In Vercel: `AI_GATEWAY_API_KEY`,
`ASSISTANT_ENABLED=true`, and `SUPABASE_URL` plus `SUPABASE_SERVICE_ROLE_KEY` so sign-ins are
kept. `ASSISTANT_ENABLED=false` and a redeploy stop every AI request; the page then shows
"Scout is paused". The page keeps `noindex`; people reach it from the projects page.

**Limits.** 1,500 characters a message, 16 turns kept, 8 requests a minute and 40 an hour per
address, and a daily cap (`ASSISTANT_DAILY_CAP`, default 400) per function instance; the
per-instance counters reset when Vercel recycles the instance, so they stop a loop rather
than meter exactly.

**Data.** The function reads the `PROJECTS` array out of `index.html` at run time (the
`functions` entry in `vercel.json` bundles it), the same extraction `scripts/projects.mjs`
uses at build time, so adding a project to the catalog adds it to what Scout can find. Bump
the `catalog-updated` meta in `index.html` when you do; the readout shows it. If the file
cannot be read, `lib/assistant/sample-projects.json` stands in: five made-up projects, ids
`sample-*`, and a "Sample data" notice on every reply.

**Running it.**

```
npm test                     # the engine against the scripted gateway (test/fake-gateway.js): no key, no network
npm run assistant:dev        # serves the page at http://localhost:3000/assistant.html with the fake model
npm run test:agent:browser   # drives the page in Chromium at 1280x845 and 390x844 (needs Playwright)
```

`node test/serve.mjs` without `--fake` and with `AI_GATEWAY_API_KEY` set calls the real
gateway; `--sample` forces the sample set; `--gate off` skips the sign-in form. The browser
drive runs a search, a follow-up, a no-match and an off-topic turn, and a spoken exchange with
a fake `SpeechRecognition` that hears a phrase and ends, so the auto-send and the hands-free
loop are checked with no microphone; it reports page errors and the card height against the
strip height.

## Security & privacy

- HTTP security headers configured in `vercel.json` (X-Frame-Options, Permissions-Policy, HSTS, etc.)
- All external links use `rel="noopener noreferrer"`
- Email addresses obfuscated and assembled at runtime to prevent scraping
- No accounts. The only thing stored about a visitor is Scout's beta sign-in: a name, an email and the first question, kept in Supabase so Christian can follow up (see "The beta gate")
- Bookmarks and progress live in `localStorage` only — never transmitted
- Microphone: only when the visitor taps a mic button, and only through the browser's own speech recognition (see "Talk instead of type" and "Talking" under Scout); Scout's spoken replies use the browser's own speech synthesis
- Scout's message box goes to `/api/assistant` and nowhere else; catalog text and pasted postings reach the model as data, never as instructions
- Third-party requests: YouTube (only when a video thumbnail is clicked), Vercel Analytics, and Vercel AI Gateway from the server when Scout is asked something

## Credit

Built and maintained by [Job Stats Miami](https://jobstatsmiami.com).
