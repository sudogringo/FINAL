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

  **Demo inbox placeholder.** The committed exports use `bandeja.demo@example.com` as the recipient of every TESIS-branch Gmail node, and `Gmail - cuenta demo` as the credential display name, so no personal address is published. A raw `export:workflow` brings the real inbox back: re-apply the placeholder before committing. After importing on a new instance, set `sendTo` to your own test inbox.

- **Credentials** (currently 4: `Google Sheets account`, `Gmail account`, `Google Drive account` — all OAuth2 — plus `Google API Key (PageSpeed)`, a static key) live only in `database.sqlite`, encrypted with `N8N_ENCRYPTION_KEY` (`n8n/.env`). To onboard a new machine (a collaborator, or your own second laptop) without re-authorizing each Google account from scratch: copy `database.sqlite` + the real `N8N_ENCRYPTION_KEY` value **outside of git** — direct file transfer or a private, non-repo channel, never a commit. The Google OAuth2 refresh tokens aren't machine-bound, so this works as-is; the one thing to keep consistent is that both instances serve on the same `localhost:4343` host:port used at the original authorization, since that's baked into the OAuth redirect. If a token ever needs re-consent and the host:port differs, redo that one credential's OAuth flow in the n8n UI — it's a one-off, not a blocker.

## Implemented

Two different things are recorded below, and they must not be confused:

- **Development history** — success/error counts read from `n8n/data/database.sqlite` (workflow + execution tables) on **2026-08-04**. They accumulate every run made while each workflow was being built and debugged, failed attempts included. The per-execution records behind them were not preserved, so the cause of those errors can't be recovered.
- **Verification batches** — each workflow executed 3 times via `n8n execute` against the full running stack, cross-checked in n8n's execution table. Script, protocol, logs and the fixes applied between batches: [`docs/research/n8n-workflow-runs/`](../research/n8n-workflow-runs/README.md). Since 08/10/2026 each run is also checked for **content** (`check-content.mjs`: real trigger, non-empty items, expected fields, delivery accepted by Gmail/Sheets), because "no execution error" turned out not to mean "correct output". The 25/09 batch was re-checked with the same criterion. A 07/10 batch is discarded: 7 of 8 workflows failed for an environment cause (the Google credentials had been revoked and were only recreated on 08/10).

| # | Workflow | Active | Dev history (success/error, 2026-08-04) | 25/09: no error / correct content | 08/10: correct content |
|---|---|---|---|---|---|
| 01 | Automated Branding | No | 7 / 13 | 3/3 · yes | 3/3 |
| 02 | Website Health & SEO Monitor | No | 4 / 8 | 3/3 · **no** (A11y/BP/SEO shown as 0/100) | 3/3 |
| 03 | Google Maps Review Management | No | 3 / 4 | 3/3 · yes (simulated reviews) | 3/3 |
| 04 | Social Media Content Engine | No | 28 / 11 | 3/3 · yes | 3/3 (rerun after sharing the content sheet; the first 3 failed with 403) |
| 05 | Monthly Activity Report | No | 6 / 8 | 3/3 · yes | 3/3 |
| 06a | Newsletter Quincenal | No | 6 / 0 | 3/3 · yes (simulated subscribers) | 3/3 |
| 06b | Carrito Abandonado | No | 4 / 1 | 3/3 · yes (simulated source) | 3/3 |
| 07 | Logistics & Shipping Automation | No | 8 / 8 | 3/3 · **no** ("Remitos", localidad shown as `null`) | 3/3 |

For 03, 06a and 06b the content check can only confirm a non-empty *simulated* output: their data sources are mocks.

`00. Lead Notification` was built after the development-history snapshot, as the instrument for VD2: 52 measured runs without failures (18 on 25/08, 34 on 08/10) plus 3 on 09/10 after escaping the quote-form fields in its message, all in `docs/research/quote-latency/results/`. Its Gmail node sends to `bandeja.demo@example.com`, which bounces after Gmail accepts the message, so t1 is Gmail's acceptance, not arrival in an inbox. It is the only workflow left active (`active=1`), for that measurement.

Fixes applied on 2026-09-25 before the final batch (exports updated in `n8n/workflows/`):

- **02** — the trigger fed the disabled `Fetch Website Links` path (so `siteUrl` was undefined) instead of the TESIS PageSpeed branch; rewired to `PSI Mobile → Wait → PSI Desktop → Merge → report → Gmail`. PSI target changed from `https://tiago-cunto.github.io/golden-harvest/` (404) to `https://sudogringo.github.io/FINAL/`; the `Google API Key (PageSpeed)` credential had expired and was renewed. The old on-page HTML check chain is left in the canvas, unfed.
- **03** — its only trigger was the Schedule Trigger; added `Manual Trigger (TESIS)` wired to the same nodes.
- **05** — both HTTP nodes pointed at `http://golden_harvest_api:8000/...`, a host that doesn't exist in the stack; now `http://backend:3001/api/stats/monthly` and `/api/orders`, and the report Code node maps the backend's response shape. "Facturación total" in the report is always $0: backend orders carry no prices.

Until 14/10/2026 all 8 workflows in the table were inactive (`active=0`) and run manually; since then 00, 04, 06b and 07 are active because they have a webhook receiver (see "Receivers, palette and activation" below); 01, 02, 03, 05 and 06a stay manual. Workflow 06 ("Lead Nurturing & Cart Interest" in the original design) was split into two: `06a. Newsletter Quincenal` (the bi-weekly schedule half) and `06b. Carrito Abandonado` (the webhook-triggered abandoned-cart half). A `_TMP_CreateSocialSheet` helper workflow also exists (scaffolding, not one of the 7 modules).

Data status per workflow (fill in / correct as work continues — this is the section the "no real access, no budget" constraint applies to directly):

- **01 Branding**: the enabled `Set Thesis URL` node points at `https://sudogringo.github.io/FINAL/`, the project's own GitHub Pages build (the older `tiago-cunto.github.io/golden-harvest/` mockup returned 404 on 2026-09-25; `Set Hardcoded URL`, pointing at the company's public site, is disabled). The extracted palette is therefore the new site's own, not the company's.
- **02 SEO Monitor**: audits `https://sudogringo.github.io/FINAL/` through the free PageSpeed Insights API. Until 08/10/2026 the requests sent no `category` parameter, so only Performance came back and the report showed Accessibility, Best Practices and SEO as 0/100; both PSI nodes now request the four categories and a missing score is shown as "N/D".
- **03 Google Maps Review Management**: fully simulated. The content comes from the `[TESIS] Mock Reviews` node; the two fetch nodes return `{}` (no Maps API key).
- **04**: Google Sheets (content sheet) or the Form Trigger. **05** and **07**: the backend API with `X-Service-Key`. **06a** and **06b**: jsonplaceholder (`/users`, `/posts`) as simulated sources. Per-workflow triggers and sources are tabulated in `CLAUDE.md`.

## Relations

- **n8n ← Frontend**: webhook `quote` (00, quote submission), `abandoned-cart` (06b, client-side 2h timer: `{ items, sessionId, timestamp }`, `frontend/src/features/cart/CartContext.tsx`) and `social-content` (04, "Publicar en redes" button: `{ name, description, line, tag, imageUrl }`, `frontend/src/pages/admin/AdminProductsPage.tsx`).
- **n8n → Backend**: read-only HTTP calls to the backend API at `http://backend:3001/api` — 05 (`GET /stats/monthly`, `GET /orders`) and 07 (`GET /orders`, `GET /orders/:id/items`). n8n never writes to the Postgres database the backend owns; persistence stays exclusively in the backend.
- **Backend → n8n**: webhooks `N8N_QUOTE_WEBHOOK` (received by `00. Lead Notification`) and `N8N_LOGISTICS_WEBHOOK` (received by `07` on `order-confirmed`: `{ orderId, quoteId, contact, items }`, `backend/src/routes/quotes.ts`). Both carry an `Idempotency-Key` header (at-least-once outbox) and both receivers drop repeated keys.
- **n8n → external services**: in the executed TESIS branches, Gmail, Google Sheets and the PageSpeed API; in the disabled PRODUCCIÓN branches (design only), SendGrid/Postmark (nurturing emails), WhatsApp Business (sales rep notification), PDFMonkey (delivery notes and labels), PageSpeed API (SEO monitor), Google Maps (reputation). Per the zero-budget constraint, each of these should be using a free tier or a simulated stand-in — see the audit table above.

## Receivers, palette and activation (14/10/2026)

Evaluators pointed out that eight workflows only ran manually, that three integration points had no receiver (abandonment, logistics, "Publicar en redes") and that the 01 -> 04 palette dependency was not implemented. The TESIS branch of each now has a production webhook (the Manual Trigger paths are kept, with simulated data, for reproducible runs). Every webhook answers through a **Respond to Webhook** node: 202 on accept, 400 on a payload that fails validation (nothing else runs), 200 on a duplicate.

| Workflow | Webhook (POST `/webhook/<path>`) | Payload validated by | What it does |
|---|---|---|---|
| 00 | `quote` | (unchanged) + dedup | quote notification (VD2 instrument) |
| 04 | `social-content` | `Validar producto (webhook)`: `name` required, the rest optional | posts for the product, e-mailed to the demo inbox (the button sends no recipient) |
| 06b | `abandoned-cart` | `Validar carrito`: non-empty `items` (`id`, `name`, `size` text, `qty` integer >= 1), `sessionId` text or null, ISO `timestamp` | discount e-mail listing exactly the cart items. The cart has no prices and no contact, so the offer is "10% off" with no amounts and the e-mail goes to the demo inbox; an optional `contact` is greeted by name |
| 07 | `order-confirmed` | `Validar orden (webhook)`: `orderId`, `contact.nombre`, non-empty `items` | **remito PDF per order** + dispatch summary e-mail with the PDFs attached |

PROD webhooks that already existed keep their disabled nodes; 07's moved to `order-confirmed-prod` (same `-prod` convention as 00).

**Remito PDF (07).** `Armar Remito HTML` (Code) builds the delivery note (order id, date, customer, delivery locality, items and units, mark "Documento no válido como factura — demo académica") and exposes it as a `data:text/html;base64,...` URL. The community node `n8n-nodes-puppeteer` (operation *Get PDF*, A4 portrait, no network needed) opens that URL and returns the PDF; `Nombrar PDF` names it `remito-<orderId>.pdf`, and `Generar Resumen de Despacho` attaches one PDF per order (`remito_1`, `remito_2`, ...) to the single Gmail message. Manual path: `GET /api/orders?estado=confirmado` has no items, so `Completar ítems de la orden` calls `GET /api/orders/:id/items` per order (service key). Shipping labels and the carrier call remain PRODUCCIÓN (PDFMonkey, carrier API).

**Palette 01 -> 04.** 01 writes `/home/node/.n8n-files/brand_palette.json` (`{ extractedAt, url, primary, secondary, palette, background }`) after extracting colours; 04 reads it (`Leer Paleta de Marca (01)`), applies it (`Aplicar Paleta de Marca`) and every post (Instagram, WhatsApp, Facebook), the image prompt and the e-mail carry the colours. Why a file and not a Google Sheet tab or static data: it needs no credentials and no change to the content sheet that the authors own; n8n static data is per workflow, so 04 cannot read 01's. Limits: it is a single "latest palette" (no history); if 04 runs before 01 ever did, or the file is unreadable, 04 uses a default palette and flags `palette_source: default` (the oracle rejects that in a measured batch). n8n only reads and writes under `~/.n8n-files`, and the write node does **not** create the folder: create it once (`docker exec golden_harvest_n8n mkdir -p /home/node/.n8n-files`) or add `RUN mkdir -p /home/node/.n8n-files` (as user `node`) to `n8n/Dockerfile`. The folder is not in the bind-mounted `n8n/data`, so it survives a container restart but not a recreation. If the write fails, 01 still sends its e-mail and the failure stays visible in the execution (`Guardar Paleta (archivo)` has *continue on error*).

**Idempotency (00 and 07).** The backend delivers webhooks at least once and sends `Idempotency-Key` (`quote:<id>:created`, `order:<id>:confirmed`). `Deduplicar (Idempotency-Key)` keeps the last 500 keys in the workflow static data; a repeated key is answered `200 { duplicate: true }` and nothing else runs. Static data only persists in production (active) executions, so Manual runs do not dedup. A request without the header is processed. The key is recorded when first seen, before processing: if a later node fails, the redelivery is not retried by n8n (the failed execution is in the execution list).

### Import and activation on the local instance

The exports in `n8n/workflows/` carry their instance ids, so importing overwrites the same workflow (credentials are referenced by id and are not touched). Commands used on 14/10/2026 (n8n 2.27.5, container `golden_harvest_n8n`):

```bash
docker cp n8n/workflows/. golden_harvest_n8n:/tmp/imp/
docker exec golden_harvest_n8n n8n import:workflow --input=/tmp/imp/04._Social_Media_Content_Engine.json   # same for 01, 06b, 07
docker exec golden_harvest_n8n n8n publish:workflow --id=<workflow id>          # replaces update:workflow --active=true (deprecated)
docker restart golden_harvest_n8n        # publish only takes effect on the next start
docker exec golden_harvest_n8n n8n list:workflow --active=true
```

Ids: 00 `fBTJ5ufX5gkAFWug`, 01 `Yvoc3v8PN45TaRAD`, 04 `Zpr1rt5YATfQix0d`, 06b `V94be0IzqzlUnAyL`, 07 `pIlvvd0nTN7mfJOL`. Two gotchas: `00._Lead_Notification.json` has no `id` (importing it as is would create a third copy: the instance already holds two copies of 00, the active `fBTJ...` and an inactive `xX5Z...`), so set `id` to the active one in a temporary copy before importing; and importing a workflow **deactivates** it ("Deactivating workflow ..."), so `publish:workflow` + restart must follow every import. Check a webhook with `curl -X POST http://localhost:4343/webhook/<path> -H 'Content-Type: application/json' -d '<payload>'`; each valid request has a real effect (an e-mail to the demo inbox). Webhook paths of workflows that are not active answer 404.

## Gotchas (n8n 2.27.5, see `docs/research/n8n-workflow-runs/VERSION.md`)

- **`$env` in expressions** is blocked unless `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`. The compose file sets it so 05 and 07 can send `X-Service-Key: {{$env.SERVICE_API_KEY}}` to the backend. Side effect: Code nodes can read every container variable, `N8N_ENCRYPTION_KEY` included, so only trusted workflows should run on this instance. Backend URLs stay hardcoded as `http://backend:3001/api` in 05 and 07; keep them in sync with `docker-compose.yml` by hand.
- **`n8n execute` from the CLI while the instance is running** fails with "Task Broker's port 5679 is already in use". Give the CLI process its own port: `docker exec -e N8N_RUNNERS_BROKER_PORT=5690 golden_harvest_n8n n8n execute --id <id> --rawOutput`.
- **The CLI can't start a workflow whose only trigger is a Schedule Trigger** ("Missing node to start execution"). Every workflow keeps a Manual Trigger next to its schedule for that reason.
- **Public API updates** (`PUT /api/v1/workflows/{id}`) accept only `name`, `nodes`, `connections` and `settings`, and reject unknown `settings` keys with 400.

See [`docs/architecture/diagram.md`](./diagram.md) for the full system diagram (target vs. as-built).
