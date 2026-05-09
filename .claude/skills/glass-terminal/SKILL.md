---
name: glass-terminal
description: Apply the BuildersBench "Glass Terminal" design system — a dark, neon-green terminal aesthetic with glassmorphism, JetBrains Mono accents, and pulsing CRT glow. Use when the user asks to build, restyle, or extend a UI to match the BuildersBench look (e.g. "make this match the site", "use the glass terminal style", "in the BuildersBench style", "apply the design system"). Provides design tokens, typography rules, component recipes (buttons, pills, cards, modals, chips, tabs), motion guidelines, and a starter HTML template.
---

# Glass Terminal Design System

The look powering `index.html`: a dark cockpit of glassy panels lit by neon-green and teal radial glows, anchored by Inter for prose and JetBrains Mono for everything that should feel like a readout.

## When to use

- Building a new page or component that should match BuildersBench
- Restyling an existing surface to feel native to the site
- Generating marketing snippets, modals, dashboards, or auxiliary tools that share the brand

## Design tokens

Drop these CSS variables onto `:root` for any new surface. They are the source of truth — never hardcode a hex.

```css
:root {
  --bg:          #0C161B;
  --bg-2:        #142028;
  --bg-elev:     #18242C;
  --bg-sunken:   #0E1A21;
  --panel:       #142028;
  --panel-2:     #1A2832;

  --glass:       rgba(255,255,255,0.045);
  --line:        rgba(255,255,255,0.14);
  --line-strong: rgba(255,255,255,0.22);
  --line-3:      rgba(0,255,133,0.32);

  --fg:          #E6F1F3;
  --ink:         #E6F1F3;
  --ink-soft:    #B7C5CB;
  --ink-muted:   #7A8A90;
  --dim:         #4B5A60;

  --green:       #00FF85;
  --green-2:     #00E676;
  --teal:        #00C2A8;
  --gold:        #FFC857;
  --accent:      #00FF85;
  --accent-soft: rgba(0,255,133,0.10);
  --green-soft:  rgba(0,255,133,0.10);
  --green-glow:  rgba(0,255,133,0.45);
  --teal-glow:   rgba(0,194,168,0.35);

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.50);
  --shadow-md: 0 8px 28px rgba(0,0,0,0.55);
  --shadow-lg: 0 24px 60px rgba(0,0,0,0.65);
}
```

### Semantics

- **Backgrounds**: `--bg` for the page, `--panel`/`--panel-2` for raised cards, `--bg-sunken` for inputs and wells.
- **Borders**: default to `--line`. Step up to `--line-strong` for emphasis, `--line-3` for accent/hover edges.
- **Type**: `--ink` for headings, `--ink-soft` for body, `--ink-muted` for eyebrows/captions, `--dim` for disabled.
- **Accent**: `--green` carries the brand. `--teal` for data/secondary, `--gold` for "in-progress" states.

## Atmosphere (mandatory)

Every page gets the twin radial glows + faint grid behind everything. Apply on `body`:

```css
body {
  font-family: 'Inter', system-ui, sans-serif;
  background: var(--bg);
  color: var(--ink);
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  font-feature-settings: 'ss01', 'cv11';
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}
body::before {
  content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 60% 50% at 0% 0%, rgba(0,194,168,0.12), transparent 60%),
    radial-gradient(ellipse 60% 60% at 100% 100%, rgba(0,255,133,0.10), transparent 60%),
    radial-gradient(circle at 50% 40%, rgba(0,255,133,0.025), transparent 70%);
}
body::after {
  content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
  background-size: 48px 48px;
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 85%);
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 85%);
}
::selection { background: rgba(0,255,133,0.30); color: #02110A; }
```

Always wrap content in `.container { max-width: 1440px; margin: 0 auto; padding: 0 28px; position: relative; z-index: 2; }` so it sits above the atmosphere.

## Typography

Load both fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

Rules of thumb:

| Role | Font | Treatment |
|---|---|---|
| Display headlines | Inter 700, `letter-spacing: -0.04em`, `line-height: 1.02`, `clamp(40px, 6.4vw, 64px)` |
| Section titles | Inter 600/700, `letter-spacing: -0.025em` |
| Body | Inter 400, 14–16px, `--ink-soft` |
| Italic flourish inside H1 | Inter 300 italic in `--ink-soft` |
| Eyebrows / labels / counters / metadata | **JetBrains Mono** 500/600, 9.5–12px, UPPERCASE, `letter-spacing: 0.16–0.24em` |
| Numbers / ticker / time | **JetBrains Mono**, often `--green` with `text-shadow: 0 0 8px var(--green-glow)` |

If something feels like an instrument readout (counts, status, timestamps, IDs, kbd hints, tags), it is JetBrains Mono. Everything else is Inter.

### Accent text

```css
.accent  { color: var(--green); text-shadow: 0 0 18px var(--green-glow); }
.serif   { font-style: italic; font-weight: 300; color: var(--ink-soft); letter-spacing: -0.03em; }
```

Optional blinking terminal cursor at the end of an H1:

```css
h1::after {
  content:''; display:inline-block; width:.5ch; height:.86em;
  margin-left:.12em; vertical-align:-0.08em;
  background: var(--green); box-shadow: 0 0 14px var(--green-glow);
  animation: cursorBlink 1.1s steps(2,end) infinite;
}
@keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
@keyframes pulse       { 0%,100%{opacity:1} 50%{opacity:.55} }
```

## Component recipes

### Glass panel (the workhorse)

```css
.panel {
  background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.012)),
              radial-gradient(ellipse at 0% 0%, rgba(0,255,133,0.10), transparent 55%);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 16px;
  padding: 30px 32px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(6px);
}
.panel::before { /* top hairline glow */
  content:''; position:absolute; top:0; left:12%; right:12%; height:1px;
  background: linear-gradient(90deg, transparent, var(--green-glow), transparent);
}
```

Use teal glow (`--teal-glow`) on secondary panels so adjacent surfaces feel related but distinct.

### Sticky header

```css
header {
  position: sticky; top: 0; z-index: 100;
  background: rgba(12, 22, 27, 0.78);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255,255,255,0.16);
}
```

Brand mark uses JetBrains Mono 12px, uppercase, `letter-spacing: 0.18em`, with a 26×26 SVG icon in `--green` carrying `filter: drop-shadow(0 0 6px var(--green-glow))`.

### Eyebrow pill

```css
.eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--ink-muted); font-weight: 500;
  padding: 6px 12px; border: 1px solid var(--line); border-radius: 999px;
  background: var(--glass);
}
.eyebrow::before { content:''; width:22px; height:1px; background: var(--green); box-shadow: 0 0 6px var(--green-glow); }
.eyebrow .dot   { width:6px; height:6px; border-radius:50%; background: var(--green); box-shadow: 0 0 10px var(--green-glow); animation: pulse 2s ease-in-out infinite; }
```

### Stat / status pill

```css
.stat-pill {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 6px 12px; border-radius: 999px;
  background: var(--glass); border: 1px solid var(--line);
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--ink-soft);
  transition: border-color .2s, box-shadow .2s, transform .2s;
}
.stat-pill:hover {
  border-color: var(--line-3);
  box-shadow: 0 0 0 1px var(--line-3), 0 12px 30px -16px rgba(0,255,133,0.25);
  transform: translateY(-1px);
}
.stat-pill .num { color: var(--green); font-weight: 600; text-shadow: 0 0 8px var(--green-glow); }
```

### Primary CTA (filled green)

```css
.btn-primary {
  padding: 12px 14px; border-radius: 10px;
  background: linear-gradient(180deg, rgba(0,255,133,0.20), rgba(0,255,133,0.08));
  border: 1px solid var(--green);
  color: var(--green);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 600;
  text-shadow: 0 0 8px var(--green-glow);
  transition: background .18s, box-shadow .18s, transform .18s;
}
.btn-primary:hover {
  background: linear-gradient(180deg, rgba(0,255,133,0.32), rgba(0,255,133,0.16));
  box-shadow: 0 0 22px -4px var(--green-glow);
  transform: translateY(-1px);
}
```

### Secondary / ghost button

```css
.btn-ghost {
  padding: 12px 14px; border-radius: 10px;
  background: none; border: 1px solid var(--line);
  color: var(--ink-soft);
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
  transition: border-color .15s, color .15s;
}
.btn-ghost:hover { border-color: var(--ink); color: var(--ink); }
```

### Filter chip / tab (pill, with neon hover)

```css
.chip {
  padding: 8px 15px; border-radius: 999px;
  background: var(--glass); border: 1px solid rgba(255,255,255,0.18);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12.5px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 500;
  color: var(--ink-soft); transition: all .2s ease;
}
.chip:hover {
  color: var(--ink); border-color: rgba(0,255,133,0.55);
  box-shadow: 0 0 0 1px rgba(0,255,133,0.55), 0 0 18px -2px rgba(0,255,133,0.50), 0 10px 28px -14px rgba(0,255,133,0.50);
  transform: translateY(-1px);
}
.chip.active {
  background: rgba(0,255,133,0.14); color: var(--green);
  border-color: rgba(0,255,133,0.65);
  box-shadow: 0 0 0 1px rgba(0,255,133,0.65), 0 0 22px -2px rgba(0,255,133,0.55);
  text-shadow: 0 0 10px var(--green-glow);
}
```

### Card with neon hover lift

```css
.card {
  background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.012));
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 14px; padding: 20px;
  position: relative;
  transition: transform .2s, border-color .25s, box-shadow .25s;
}
.card::before {
  content:''; position:absolute; inset:0; border-radius:inherit; pointer-events:none;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(0,255,133,0.18), transparent 65%),
    radial-gradient(ellipse at 100% 100%, rgba(0,194,168,0.10), transparent 65%);
  opacity: 0; transition: opacity .3s;
}
.card > * { position: relative; z-index: 1; }
.card:hover {
  border-color: rgba(0,255,133,0.60); transform: translateY(-2px);
  box-shadow:
    0 0 0 1px rgba(0,255,133,0.60),
    0 0 24px -2px rgba(0,255,133,0.45),
    0 0 60px -12px rgba(0,255,133,0.40),
    0 24px 60px -22px rgba(0,0,0,0.65);
}
.card:hover::before { opacity: 1; }
@media (prefers-reduced-motion: reduce) {
  .card, .card::before { transition: none; }
  .card:hover { transform: none; }
}
```

State stripes use a 2px left border: `--gold` for in-progress, `--green` for done.

### Tag

```css
.tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; letter-spacing: 0.10em; text-transform: uppercase; font-weight: 500;
  padding: 4px 8px; border-radius: 4px;
  background: rgba(0,0,0,0.40); color: var(--ink-soft);
  border: 1px solid rgba(255,255,255,0.16);
}
```

### Level badge (semantic chip)

```css
.level { font-family:'JetBrains Mono',monospace; font-size:10.5px; letter-spacing:.18em; text-transform:uppercase; font-weight:600; padding:5px 11px; border-radius:999px; border:1px solid currentColor; background: rgba(0,0,0,0.30); }
.level-beginner     { color: var(--teal); }
.level-intermediate { color: var(--gold); }
.level-advanced     { color: var(--green); text-shadow: 0 0 8px var(--green-glow); }
```

### Modal

```css
.modal-backdrop {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(2,5,7,0.72);
  backdrop-filter: blur(8px);
  display: none; align-items: flex-start; justify-content: center;
  padding: 40px 20px 0; overflow-y: auto;
}
.modal-backdrop.open { display: flex; animation: fadeIn .2s ease; }
.modal {
  background: linear-gradient(180deg, rgba(14,26,33,0.96), rgba(8,17,26,0.96));
  border: 1px solid var(--line-strong);
  border-radius: 16px; max-width: 820px; width: 100%; padding: 44px;
  position: relative;
  box-shadow:
    0 0 0 1px var(--line-3),
    0 32px 80px rgba(0,0,0,0.65),
    0 0 60px -20px rgba(0,255,133,0.30);
  animation: slideUp .3s ease;
}
.modal::before { content:''; position:absolute; top:0; left:12%; right:12%; height:1px; background: linear-gradient(90deg, transparent, var(--green-glow), transparent); }
@keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
```

### Section divider with neon ends

```css
.section-divider {
  position: relative;
  border-top: 1px solid rgba(255,255,255,0.10);
  border-bottom: 1px solid rgba(255,255,255,0.10);
}
.section-divider::before {
  content:''; position:absolute; top:-1px; left:0; right:0; height:1px;
  background: linear-gradient(90deg, var(--green) 0%, rgba(0,255,133,0.65) 8%, rgba(0,255,133,0.20) 22%, transparent 50%);
  box-shadow: 0 0 14px var(--green-glow);
}
.section-divider::after {
  content:''; position:absolute; bottom:-1px; left:0; right:0; height:1px;
  background: linear-gradient(90deg, transparent 50%, rgba(0,255,133,0.20) 78%, rgba(0,255,133,0.65) 92%, var(--green) 100%);
}
```

## Motion

- Transitions are short (`.15s`–`.25s`) and ease-out. Avoid bounces.
- Hover lifts: `translateY(-1px)` on small controls, `translateY(-2px)` on cards. Pair with a green outer glow.
- Use `pulse` (2s) for live dots, `cursorBlink` (1.1s steps) for the cursor caret.
- Always wrap motion in `@media (prefers-reduced-motion: reduce)` and disable transforms.

## Iconography

Lucide-style line SVGs, inlined, `stroke-width: 2`. Recolor with `currentColor` and add `filter: drop-shadow(0 0 6px var(--green-glow))` when active. Sizes: 16px in chips, 26–30px for brand/section icons.

## Layout

- Container: `max-width: 1440px`, side padding `28px` (`22px` ≤ 1100px).
- Grids: 3-up project grids, 280px / 1fr for "label + content" sections.
- Sticky controls: `top: 56px` (header height), `backdrop-filter: blur(10px)`.

## Do / Don't

**Do**
- Pair every neon edge with a soft outer glow (`box-shadow: 0 0 18px -2px var(--green-glow)`).
- Reach for JetBrains Mono whenever the text labels a value, status, or metric.
- Render hairline accents (top of panels, top/bottom of section dividers) in green/teal gradients.

**Don't**
- Use pure white (`#fff`) anywhere — it breaks the muted glass mood. Use `--ink`.
- Stack two filled green CTAs side by side; pair primary with ghost.
- Animate everything. The green glow is the punctuation; let surfaces stay still.
- Use shadows without a tinted color — every shadow has either green, teal, or near-black RGB.

## Starter template

A minimal page that already wears the look:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Surface — Glass Terminal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    /* paste tokens + atmosphere from this skill */
  </style>
</head>
<body>
  <header>
    <div class="container header-inner">
      <div class="brand">
        <span class="brand-mark">BUILDERS<span class="brand-dot">.</span>BENCH</span>
      </div>
    </div>
  </header>

  <main class="container">
    <section class="panel" style="margin-top:56px">
      <span class="eyebrow"><span class="dot"></span> Live · v1</span>
      <h1 class="display">Build like it’s <span class="serif">already</span> <span class="accent">shipped</span>.</h1>
      <p class="hero-lede">Body copy in Inter 400, --ink-soft.</p>
      <div style="display:flex; gap:8px; margin-top:18px">
        <button class="btn-primary">Get started</button>
        <button class="btn-ghost">Learn more</button>
      </div>
    </section>
  </main>
</body>
</html>
```

## Reference

Full implementation lives in `index.html` at the repo root. Copy patterns from there before reinventing them — every surface in this skill exists in that file.
