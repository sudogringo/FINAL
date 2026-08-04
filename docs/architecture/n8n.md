# n8n (Process Orchestrator)

## Need

All the business logic that isn't "serve the catalog and store a quote" — marketing, logistics, social media, reputation management — needs to live somewhere that isn't hardcoded into the frontend or backend, so it can change independently and (per the thesis's reusability goal) be lifted into other projects. n8n is that layer: every automation is an independent, modular workflow triggered by a webhook or a schedule, not application code.

**Project constraint that shapes every workflow here**: the students have no access to Golden Harvest's real website, backend, or private data, and no budget for paid APIs (see `CLAUDE.md` → Project Constraints). Every workflow below must be read with that in mind — "implemented" means implemented against simulated/free-tier data, not the real company.

## Design

- **Self-hosted via Docker**, `docker-compose.yml` `n8n` service (official `docker.n8n.io/n8nio/n8n` image — no custom Dockerfile exists), SQLite storage under `n8n/data/` (bind-mounted, portable — see `n8n/README.md` if present for migration notes), public URL fixed to `localhost:4343` via env vars in `n8n/.env` (`N8N_PORT`, `WEBHOOK_URL`, etc.) so OAuth redirects resolve correctly instead of n8n's default `5678`.
- **Modular, independent workflows** — the seven modules designed in `n8n_workflows.md` are built as separate n8n workflows, each importable/exportable on its own. The only designed inter-workflow dependency is Branding → Social Media Content Engine (color palette feeds post generation).
- **Credentials manager workaround**: n8n's built-in credentials UI is awkward to work with for this project's needs (frequent recreation, poor portability across machines). Where reasonable, config is passed via `.env` files or webhook payloads instead of n8n's credentials store.

## Implemented

Verified directly against `n8n/data/database.sqlite` (workflow + execution tables) — this is ground truth, not a guess:

| # | Workflow | Active | Executions (success/error) |
|---|---|---|---|
| 01 | Automated Branding | No | 7 / 13 |
| 02 | Website Health & SEO Monitor | No | 4 / 8 |
| 03 | Google Maps Review Management | No | 3 / 4 |
| 04 | Social Media Content Engine | No | 28 / 11 |
| 05 | Monthly Activity Report | No | 6 / 8 |
| 06a | Newsletter Quincenal | No | 6 / 0 |
| 06b | Carrito Abandonado | No | 4 / 1 |
| 07 | Logistics & Shipping Automation | No | 8 / 8 |

All 8 real workflows exist and have been manually executed/tested (none are on an active schedule or live webhook right now — `active=0` for all). Workflow 06 ("Lead Nurturing & Cart Interest" in the original design) was split into two: `06a. Newsletter Quincenal` (the bi-weekly schedule half) and `06b. Carrito Abandonado` (the webhook-triggered abandoned-cart half). A `_TMP_CreateSocialSheet` helper workflow also exists (scaffolding, not one of the 7 modules).

Data status per workflow (fill in / correct as work continues — this is the section the "no real access, no budget" constraint applies to directly):

- **01 Branding**: extracts colors from a real *public* URL (`https://tiago-cunto.github.io/golden-harvest/` — the students' own GitHub Pages mockup, not Golden Harvest's real site) — compliant with the no-real-access constraint since it's a site the students control. Output stored in `n8n/data/brand_colors.json`.
- **03 Google Maps Review Management**: has a `reviews_processed.json` output file — verify whether reviews are pulled from a real (free-tier) Google Maps API against a placeholder listing, or fully simulated, before citing this in the thesis as a "live integration."
- **02, 04, 05, 06a, 06b, 07**: data source (simulated vs. free-tier API) not yet audited in this pass — check each workflow's HTTP Request / trigger nodes and record findings here before writing the corresponding thesis section.

## Relations

- **n8n ← Frontend**: webhook triggers on quote submission and on abandoned-cart detection (client-side 2h timer).
- **n8n → Backend**: none currently. n8n does not read or write the Postgres database the backend owns — no `depends_on` between the two services in `docker-compose.yml`, and no HTTP calls from n8n workflows into backend routes exist yet. If Logistics Automation (07) needs quote data, it currently must get it from the triggering webhook payload, not a backend lookup.
- **n8n → external services**: SendGrid/Postmark (nurturing emails), WhatsApp Business + email (sales rep notification), PDFMonkey or HTML node (shipping labels/remitos), PageSpeed API (SEO monitor), Google Maps (reputation). Per the zero-budget constraint, each of these should be using a free tier or a simulated stand-in — see the audit table above.
