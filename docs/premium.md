# Premium career road (members page)

`/premium.html` is a members-only page: a visitor types a target role (for
example "junior cloud") and gets a vertical road for it: projects from the
catalog, certifications Florida employers ask for, who is hiring in Florida,
early-career salary, resume tips, LinkedIn tips, interview videos, and
workshop material.

The page is not linked from navigation and carries `noindex`. The real gate is
the password, not the URL.

## How access works

- One shared password, stored as the `PREMIUM_PASSWORD` environment variable
  in Vercel (Project → Settings → Environment Variables, Production and
  Preview). There is no fallback: until it is set, the sign-in form says
  access is not configured.
- `POST /api/premium-login` checks the password in constant time and returns a
  signed token good for 30 days. The signing key is derived from the password,
  so changing the password signs everyone out.
- `GET /api/premium-data` returns the road data only with a valid token. The
  data file is imported by the function and never served as a static file.
- The browser keeps the token in `localStorage` under `bb-premium-token`.
  "Sign out on this device" clears it.

Rate limiting is left to Vercel. A wrong password waits half a second before
answering, which is enough to make guessing slow.

## Where the content lives

`premium-data/roles.mjs` holds one entry per role. Fields:

| Field | What goes there |
| --- | --- |
| `id`, `title`, `path` | Stable id, display title, catalog path id |
| `track` | `aws` for the Cloud Practitioner cohort (shown first), `general` for later cohorts |
| `aliases` | Phrases a visitor might type; matching is substring and token based |
| `summary` | One or two sentences about the role in Florida |
| `salary.range`, `salary.note` | Florida early-career base band and a one-line caveat |
| `projects` | Catalog project ids; the page deep-links `index.html#project=<id>` |
| `certs` | `{ name, org, why }` |
| `companies` | `{ name, city, note }`, Florida employers with steady entry hiring |
| `resumeTips`, `linkedinTips` | Short, specific, imperative lines |
| `videos` | `{ id, title, by? }` YouTube ids; CI checks they still embed |
| `materials` | `{ title, kind, url, note? }` links to slides, notes, templates |

`vite build` fails if a project id is not in the catalog, a video id is not 11
characters, or a required list is empty. The weekly "Check videos" workflow
also verifies every premium video still embeds.

## Adding workshop material

Upload the file somewhere members can reach it (a shared Drive folder works)
and add a `materials` entry with the link. The page shows a placeholder for
roles that have none yet. Because the page is static, files in the repo are
public, so do not commit private material into `public/`.
