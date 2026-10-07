# Click heatmap

A private dashboard at `/heatmap.html` that shows where visitors click on
each page, drawn as a density overlay on a live preview of that page.

## Pieces

| File | Role |
| --- | --- |
| `clicks.js` | Collector, loaded on every public page. Records click position, document and viewport size, a short label for the element, device class, new/returning, and a per-tab session id. Batches to `/api/clicks` with `fetch`, and `sendBeacon` on page hide. Does nothing when the page is inside the dashboard's preview frame. |
| `api/clicks.js` | Vercel function. `POST` validates and inserts rows into Supabase. `GET` (bearer `HEATMAP_KEY`) returns page totals or raw points for one page. |
| `heatmap.html` | The dashboard. Asks for the key once, keeps it in `localStorage`, renders the overlay on a canvas over a same-origin `<iframe>` of the page. |
| Supabase `public.bb_click_events` | Storage, plus two `security definer` functions `bb_click_pages` and `bb_click_points` used by the GET endpoint. RLS is on with no anon/authenticated policies, so only the service role can touch it. |

## Environment variables (Vercel project settings)

| Name | Value |
| --- | --- |
| `SUPABASE_URL` | `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service role key. Server-only. |
| `HEATMAP_KEY` | Any long random string. Paste it into the dashboard's key box. |

Until `SUPABASE_URL` and the service role key are set, `POST /api/clicks`
answers 204 and drops the events, so the collector is harmless on a deploy
that is not configured yet.

## What is stored

No IP address, user agent, cookies or account data. One row per click:
timestamp, path, x/y in document pixels, viewport and document size, an
element label like `button .btn "Save"`, device class, new/returning, a
random session id, and a rage-click flag (3+ clicks within 30 px in a
second).

## How clicks land on the preview

Clicks are recorded at whatever viewport the visitor had. The dashboard
renders the page at a fixed width per device filter (1280 desktop, 820
tablet, 390 mobile) and scales each click by `preview width / doc_w` and
`preview height / doc_h`. Filtering by device gives the most faithful
picture; "All devices" mixes layouts and is only a rough view.

## Headers

`vercel.json` allows same-origin framing (`frame-ancestors 'self'`,
`X-Frame-Options: SAMEORIGIN`, `frame-src 'self'`) so the dashboard can
preview the site's own pages. Other origins still cannot frame the site.
