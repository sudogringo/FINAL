# n8n (Process Orchestrator)

## Need

All the business logic that isn't "serve the catalog and store a quote" — marketing, logistics, social media, reputation management — needs to live somewhere that isn't hardcoded into the frontend or backend, so it can change independently and (per the thesis's reusability goal) be lifted into other projects. n8n is that layer: every automation is an independent, modular workflow triggered by a webhook or a schedule, not application code.

**Project constraint that shapes every workflow here**: the students have no access to Golden Harvest's real website, backend, or private data, and no budget for paid APIs (see `CLAUDE.md` → Project Constraints). Every workflow below must be read with that in mind — "implemented" means implemented against simulated/free-tier data, not the real company.

## Design

- **Self-hosted via Docker**, `docker-compose.yml` `n8n` service (built from `n8n/Dockerfile`: `node:24-alpine` plus Chromium, with n8n installed globally via npm and pinned by `ARG N8N_VERSION=2.27.5`, and the `n8n-nodes-puppeteer` community node), SQLite storage under `n8n/data/` (bind-mounted, portable — see `n8n/README.md` if present for migration notes), public URL fixed to `localhost:4343` via env vars in `n8n/.env` (`N8N_PORT`, `WEBHOOK_URL`, etc.) so OAuth redirects resolve correctly instead of n8n's default `5678`.
- **Modular, independent workflows** — the seven modules designed in [`n8n_workflows.md`](n8n_workflows.md) are built as separate n8n workflows, each importable/exportable on its own. As built, that is nine functional workflows — `00` (Lead Notification, the VD2 measurement instrument) plus `01`–`07` with module 6 split into `06a`/`06b` — and one auxiliary (`_TMP_CreateSocialSheet`), all exported under `n8n/workflows/`. The only designed inter-workflow dependency is Branding → Social Media Content Engine (color palette feeds post generation).
- **Credentials manager workaround**: n8n's built-in credentials UI is awkward to work with for this project's needs (frequent recreation, poor portability across machines). Where reasonable, config is passed via `.env` files or webhook payloads instead of n8n's credentials store.

## Version control: workflows vs. runtime data

`n8n/data/database.sqlite` is **not** tracked in git — it mixes workflow definitions, encrypted credentials, and execution history in one binary blob with no usable diff, and it must never end up in a repo that could go public. Two separate mechanisms replace it:

- **Workflow definitions** are exported to JSON and tracked at `n8n/workflows/*.json` (one file per workflow, named after the workflow, e.g. `01._Automated_Branding.json`). Re-export after any workflow change:
  ```bash
  docker exec golden_harvest_n8n n8n export:workflow --all --output=/tmp/wf_export --separate
  docker cp golden_harvest_n8n:/tmp/wf_export/. n8n/workflows/
  ```
  These exports reference credentials only by `id`/`name` — no secret values are ever embedded in them, so they're safe to commit regardless of repo visibility.

- **Credentials** (currently 4: `Google Sheets account`, `Gmail account`, `Google Drive account` — all OAuth2 — plus `Google API Key (PageSpeed)`, a static key) live only in `database.sqlite`, encrypted with `N8N_ENCRYPTION_KEY` (`n8n/.env`). To onboard a new machine (a collaborator, or your own second laptop) without re-authorizing each Google account from scratch: copy `database.sqlite` + the real `N8N_ENCRYPTION_KEY` value **outside of git** — direct file transfer or a private, non-repo channel, never a commit. The Google OAuth2 refresh tokens aren't machine-bound, so this works as-is; the one thing to keep consistent is that both instances serve on the same `localhost:4343` host:port used at the original authorization, since that's baked into the OAuth redirect. If a token ever needs re-consent and the host:port differs, redo that one credential's OAuth flow in the n8n UI — it's a one-off, not a blocker.

## Implemented

Two different things are recorded below, and they must not be confused:

- **Development history** — success/error counts read from `n8n/data/database.sqlite` (workflow + execution tables) on **2026-08-04**. They accumulate every run made while each workflow was being built and debugged, failed attempts included. The per-execution records behind them were not preserved, so the cause of those errors can't be recovered.
- **Current state** — each workflow executed 3 times on **2026-09-25** via `n8n execute` against the full running stack, cross-checked in n8n's execution table. Script, protocol, logs and the fixes applied between the first (failing) and final batch: [`docs/research/n8n-workflow-runs/`](../research/n8n-workflow-runs/README.md). This is the number that says whether a workflow works.

| # | Workflow | Active | Dev history (success/error, 2026-08-04) | Current state (2026-09-25) |
|---|---|---|---|---|
| 01 | Automated Branding | No | 7 / 13 | 3 / 3 OK |
| 02 | Website Health & SEO Monitor | No | 4 / 8 | 3 / 3 OK |
| 03 | Google Maps Review Management | No | 3 / 4 | 3 / 3 OK |
| 04 | Social Media Content Engine | No | 28 / 11 | 3 / 3 OK |
| 05 | Monthly Activity Report | No | 6 / 8 | 3 / 3 OK |
| 06a | Newsletter Quincenal | No | 6 / 0 | 3 / 3 OK |
| 06b | Carrito Abandonado | No | 4 / 1 | 3 / 3 OK |
| 07 | Logistics & Shipping Automation | No | 8 / 8 | 3 / 3 OK |

`00. Lead Notification` was built after the development-history snapshot, as the instrument for VD2; its measured runs (18, no failures) are recorded in `docs/research/quote-latency/results/`. It is the only workflow left active (`active=1`), for that measurement.

Fixes applied on 2026-09-25 before the final batch (exports updated in `n8n/workflows/`):

- **02** — the trigger fed the disabled `Fetch Website Links` path (so `siteUrl` was undefined) instead of the TESIS PageSpeed branch; rewired to `PSI Mobile → Wait → PSI Desktop → Merge → report → Gmail`. PSI target changed from `https://tiago-cunto.github.io/golden-harvest/` (404) to `https://sudogringo.github.io/FINAL/`; the `Google API Key (PageSpeed)` credential had expired and was renewed. The old on-page HTML check chain is left in the canvas, unfed.
- **03** — its only trigger was the Schedule Trigger; added `Manual Trigger (TESIS)` wired to the same nodes.
- **05** — both HTTP nodes pointed at `http://golden_harvest_api:8000/...`, a host that doesn't exist in the stack; now `http://backend:3001/api/stats/monthly` and `/api/orders`, and the report Code node maps the backend's response shape. "Facturación total" in the report is always $0: backend orders carry no prices.

All 8 workflows in the table are inactive (`active=0`) and are run manually. Workflow 06 ("Lead Nurturing & Cart Interest" in the original design) was split into two: `06a. Newsletter Quincenal` (the bi-weekly schedule half) and `06b. Carrito Abandonado` (the webhook-triggered abandoned-cart half). A `_TMP_CreateSocialSheet` helper workflow also exists (scaffolding, not one of the 7 modules).

Data status per workflow (fill in / correct as work continues — this is the section the "no real access, no budget" constraint applies to directly):

- **01 Branding**: extracts colors from a real *public* URL (`https://tiago-cunto.github.io/golden-harvest/` — the students' own GitHub Pages mockup, not Golden Harvest's real site) — compliant with the no-real-access constraint since it's a site the students control. Output stored in `n8n/data/brand_colors.json`. Note: that URL returned 404 on 2026-09-25 (see 02 above); 01 still completed 3/3, so check whether its colors now come from a fallback rather than the page.
- **02 SEO Monitor**: audits `https://sudogringo.github.io/FINAL/` (the new catalog's GitHub Pages deploy) through the free PageSpeed Insights API.
- **03 Google Maps Review Management**: has a `reviews_processed.json` output file — verify whether reviews are pulled from a real (free-tier) Google Maps API against a placeholder listing, or fully simulated, before citing this in the thesis as a "live integration."
- **02, 04, 05, 06a, 06b, 07**: data source (simulated vs. free-tier API) not yet audited in this pass — check each workflow's HTTP Request / trigger nodes and record findings here before writing the corresponding thesis section.

## Relations

- **n8n ← Frontend**: webhook triggers on quote submission and on abandoned-cart detection (client-side 2h timer).
- **n8n → Backend**: read-only HTTP calls to the backend API at `http://backend:3001/api` — 05 (`GET /stats/monthly`, `GET /orders`) and 07 (`GET /orders`). n8n never writes to the Postgres database the backend owns; persistence stays exclusively in the backend.
- **Backend → n8n**: webhooks `N8N_QUOTE_WEBHOOK` (received by `00. Lead Notification`) and `N8N_LOGISTICS_WEBHOOK` (no receiving workflow yet; 07 runs from its Manual Trigger).
- **n8n → external services**: SendGrid/Postmark (nurturing emails), WhatsApp Business + email (sales rep notification), PDFMonkey or HTML node (shipping labels/remitos), PageSpeed API (SEO monitor), Google Maps (reputation). Per the zero-budget constraint, each of these should be using a free tier or a simulated stand-in — see the audit table above.

## Gotchas (n8n 2.35)

- **`$env` is denied in expressions** ("access to env vars denied"), so `{{$env.GH_API_BASE_URL}}` doesn't work in node parameters. Backend URLs are hardcoded as `http://backend:3001/api` in 05 and 07; keep them in sync with `docker-compose.yml` by hand.
- **`n8n execute` from the CLI while the instance is running** fails with "Task Broker's port 5679 is already in use". Give the CLI process its own port: `docker exec -e N8N_RUNNERS_BROKER_PORT=5690 golden_harvest_n8n n8n execute --id <id> --rawOutput`.
- **The CLI can't start a workflow whose only trigger is a Schedule Trigger** ("Missing node to start execution"). Every workflow keeps a Manual Trigger next to its schedule for that reason.
- **Public API updates** (`PUT /api/v1/workflows/{id}`) accept only `name`, `nodes`, `connections` and `settings`, and reject unknown `settings` keys with 400.

See [`docs/architecture/diagram.md`](./diagram.md) for the full system diagram (target vs. as-built).
