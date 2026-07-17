# BuildersBench.dev — Design Refinement Guidelines (v2.0 Review)

A senior product-design audit of the live product: `index.html` (catalog + My Bench),
`match.html` (Career Match), `certifications.html`, and `prompts.html`.

**The premise of this review:** the product works and the visual identity — the
"Glass Terminal" system (`#0C161B` base, `#00FF85` neon green, teal/gold secondaries,
Inter + JetBrains Mono, glass panels with hairline glows) — is strong and should not
change. Everything below is refinement, not redesign. The goal is that v2.0 feels
like the same product, matured.

**The one strategic note before the lists:** recent releases (Kanban Bench, step
checklists, focus pinning, velocity stat, list dropdown) have added capability
faster than they've added *connective tissue*. The biggest wins in this document
are not new features — they are fixing trust, navigation, and the loops between
pages that already exist.

---

## 1. Features to Keep Exactly As They Are

These pass the "Would Apple ship this? Would Linear keep this?" test as-is.

- **The Glass Terminal identity.** The twin radial glows, masked grid, mono
  eyebrows, and green-glow punctuation are distinctive and consistently applied.
  Do not touch tokens, type, or atmosphere.
- **The per-page accent coding.** Green = projects, gold = certifications,
  teal = prompts — carried through card glows, section rules, and Career Match's
  three result sections. This is the site's best systems-level design idea. Extend
  it; never break it.
- **The step-derived progress model.** Status (Backlog / In Progress / Done) is
  *derived* from checked roadmap steps rather than self-declared. That's honest,
  Linear-grade state modeling. Keep it as the single source of truth.
- **The project modal's depth.** Roadmap → tech stack → starter prompt → resume
  bullets → interview pitch → ship-it toolkit is the product's core value. Long,
  but the in-modal back-to-top handles it. Don't split it into tabs or pages.
- **Career Match's core flow.** One textarea, one button, one plan. The no-match
  recovery chips, the "Also a fit:" alternate path, and the honest "keyword match,
  not a recruiter" disclaimer are all exactly right.
- **The privacy model.** localStorage-only, no accounts, obfuscated email,
  versioned JSON export/import with merge-on-import. A genuine differentiator —
  keep saying so in the UI.
- **Deep links.** `#project=<id>` and `#list=<base64>` with the merge-confirm
  dialog. Working, simple, shareable.
- **Accessibility hygiene already in place.** Modal focus trap + focus restore,
  `prefers-reduced-motion` coverage, keyboard-activatable cards, arrow-button
  fallback for Bench drag-and-drop. Protect these in every future change.
- **One-click copy on prompt cards** with inline "Copied ✓" + toast. It's the
  page's single job and it does it well.

---

## 2. Small Improvements

Low-effort, high-trust fixes. All reuse existing components and tokens.

### Trust & correctness

1. **Fix the "Free" badge on certification cards.** `providerCardHTML`
   (`certifications.html:2576`) hardcodes a green `Free` badge on every provider
   card — including AWS ("free prep · paid exam") and Google/IBM ("free to
   audit"). It contradicts the page's own gold per-row cost flags and disclaimer.
   Derive the badge from data: `Free` (green) / `Free to audit` / `Free prep`
   (gold, reusing `.cert-flag` styling). This is the site's single biggest trust
   issue and it's a one-function fix.
2. **Fix the undefined `--surface-2` variable.** `#back-to-top` references
   `var(--surface-2)`, which is never defined (`index.html:2265`,
   shared stylesheet line ~1856 on the other pages) — the button renders with a
   transparent background on all four pages. Use `--panel-2`.
3. **Fix the `theme-color` meta** (`#0a0f0a`) to match the real background
   `#0C161B` on certifications/prompts.
4. **Write per-project interview follow-up questions.** The five questions are
   currently identical for all 35 projects (`INTERVIEW_QUESTIONS`,
   `index.html:4216`) — generic content sitting beside otherwise per-project
   generated material. Even 2 project-specific + 3 shared questions would fix the
   "template smell."

### Navigation consistency

5. **Unify the header across all four pages.** Today: index has 3 nav pills +
   3 stat pills, prompts has 2, certifications and match have 1. Adopt one
   canonical header: brand + Projects / Match / Certs / Prompts as `.stat-pill`
   nav links (current page omitted or marked active). The footer "Explore" block
   is already consistent — make the header match it. This also fixes the
   certs→prompts dead end.
6. **Restore mobile header navigation.** `.header-actions .stat-pill
   { display:none }` at ≤640px (`index.html:2523`, `match.html:2087`) removes
   *all* header actions on phones: on match.html the only way back to the catalog
   is the footer; on index.html **My Bench, saved, and done counts have no mobile
   entry point at all**. Reuse the icon-collapse pattern prompts.html already has
   at ≤430px (icon-only pills) instead of hiding them.
7. **Close the Career Match → Certifications loop.** Match's cert
   recommendations link only to external providers. Keep the external CTA, but
   make the card body link to `/certifications.html` (the site already maintains
   that page; recommending certs while bypassing it is a missed internal loop).

### Interaction polish

8. **Surface the Cmd/Ctrl+Enter shortcut on Career Match.** The shortcut exists
   (`match.html:2899`) but is invisible; plain Enter inserts a newline. Add a
   small mono `⌘↵` kbd hint inside the textarea's corner or next to the button —
   the mono-tag component already exists.
9. **Make injected Career Match controls keyboard-real.** `[data-pick]` path
   chips and the `[data-pick2]` alt-path link are mouse-only spans/anchors with
   no href/tabindex/role. Render them as `<button class="filter-chip">` —
   the component already exists and matches visually.
10. **Announce dynamic results.** Add `aria-live="polite"` to `#match-output`
    and the shared toast, and move focus to the results heading after a match
    run. Zero visual change.
11. **Add `scroll-margin-top` to prompts stage headers** so the stage filter's
    `scrollIntoView` doesn't tuck headings under the sticky bar, and add
    `aria-pressed` to active filter chips (prompts + index).
12. **Give filter chips and stat pills an explicit `:focus-visible` state** —
    the green hover treatment already defines what it should look like; reuse it.
13. **Normalize the "not clickable" card affordance.** Provider and prompt cards
    correctly disable hover-lift but keep the colored hover glow, which still
    reads as clickable. Reduce glow ~50% on non-interactive cards, keep it full
    on interactive ones — the glow becomes a true signal instead of decoration.
    (Also: on certification rows, either link every cert name or none per card —
    the current some-linked mix is an uneven affordance.)

### Engineering debt with UX consequences

14. **Extract the shared stylesheet.** All four pages carry a near-identical
    ~2,200-line CSS block; match/certs/prompts use a fraction of it (dead quiz,
    feed, modal, toolkit, deploy rules). One `styles.css` (Vite already bundles)
    ends the copy-paste drift that produced the `--surface-2` bug and the
    `.cert-hero` class on the prompts page. This is the highest-leverage
    consistency investment available.
15. **De-duplicate the Career Match project catalog.** `match.html` carries a
    hand-copied snapshot of `PROJECTS`; drift silently breaks `#project=` deep
    links (the modal just fails to open). Generate one shared data file at build
    time, or add a tiny runtime guard that hides cards whose id no longer exists.

---

## 3. High-Impact New Features

Three additions. Each solves a verified user problem, lives inside an existing
surface, and reuses existing components. Nothing else made the cut.

### 3.1 Catalog search

- **Why:** 35 projects, zero text search. A student who heard "build a SIEM
  dashboard" must guess the path tab and scan cards. Filtering is the catalog's
  whole interaction model, and it's missing its most obvious instrument.
- **Where:** the existing sticky controls bar on index.html, left of the status
  chips — a single `--bg-sunken` mono input styled like Career Match's textarea:
  `> search projects…` with the blinking-caret idiom the brand already owns.
  A terminal that can't be typed into is a missed thematic beat; this feature is
  *more* on-brand than its absence.
- **Discovery:** visible placeholder in the bar; `/` focuses it (hint shown as a
  mono kbd tag, the pattern Linear uses).
- **Interaction with existing features:** filters the same `renderProjects()`
  pipeline; composes with path tabs and status chips; Reset clears it. Matches
  against title, summary, tags, and tech stack.

### 3.2 Path-level deep links — `#path=<id>`

- **Why:** Career Match tells a user "you're a Cloud person" and then hands them
  three individual projects — there is no "see all Cloud projects" handoff, and
  no shareable URL for a filtered catalog view. The site already deep-links
  projects and lists; paths are the missing third noun.
- **Where:** `openProjectFromHash()` already parses hashes on index.html; add
  `#path=` alongside `#project=` and `#list=`. Then: (a) Career Match's best-fit
  card gains one `View all {path} projects →` link (the `.sec-link` component
  that already exists for prompts), (b) footer path links become real URLs
  instead of JS-only click handlers, (c) path tabs update the hash so any
  filtered view is shareable.
- **Discovery:** organic — users arrive via match results and footer links.
- **Interaction:** pure extension of the existing tab-filter state; no new UI
  surface at all.

### 3.3 "Continue" pill — resume where you left off

- **Why:** the product now records exactly which step of which project a user is
  on, but a returning visitor lands on the same static hero as a first-timer and
  must re-find their project themselves. The data to remove that friction
  already exists (`stepProgress` + `stepDates`).
- **Where:** one `.stat-pill`-styled pill in the hero CTA row, shown only when
  an in-progress project exists: `▶ Continue: API Monitor — step 3/6`. Clicking
  opens that project's modal scrolled to the roadmap. First-time visitors see
  today's hero, unchanged.
- **Discovery:** it appears exactly when it's relevant and never before —
  the Apple test for contextual UI.
- **Interaction:** reads the most-recently-touched started project from
  `stepDates`; reuses `openModal()`; respects the derived-status model. If the
  Bench's focus list is non-empty, prefer the focused project — which finally
  gives Weekly Focus a payoff outside the Bench view and makes the `◎` feature
  discoverable.

---

## 4. Nice-to-Have Future Ideas

Worth a card on the wall, not worth building yet.

- **Related prompts inside the project modal.** The prompt library's six stages
  map cleanly onto the six-step roadmap; a single teal `Prompts for this step →`
  link per roadmap section would tie the two surfaces together. (Do after the
  shared-stylesheet extraction, not before.)
- **Cert tracking.** A bookmark-style "earned / studying" toggle on
  certification rows, persisted like project bookmarks, surfaced as one gold
  stat pill. Only if users ask — the page works as a directory.
- **Shareable Bench snapshot.** Render My Bench (columns + velocity) to a
  PNG/OG image for LinkedIn — the audience literally builds portfolios to post
  there. High appeal, but new rendering machinery; keep it on the shelf.
- **Mobile stage jumper on prompts.html.** The stage filter scrolls away at
  ≤640px; a floating mono stage-picker (reusing back-to-top styling) would
  restore wayfinding. Do it if mobile analytics show prompts traffic.
- **Career Match matcher upgrades.** Synonym lists per path (e.g. "prompt
  engineer", "QA", "network engineer") to shrink the no-match dead end — data
  work, no UI change. Skip anything ML-shaped; the disclaimer's honesty is a
  feature.
- **A `404.html` wearing the terminal skin** (`path not found — cd /`), because
  the brand has a canonical way to be charming and it costs one small page.

## Explicitly not recommended

- Light theme — the identity is the dark cockpit; a theme toggle dilutes it.
- Accounts/cloud sync — the localStorage privacy story is a differentiator.
- More hero CTAs, more stat pills, more dashboard widgets on the Bench —
  velocity + focus is already the ceiling. The next Bench feature should replace
  something, not join it.
