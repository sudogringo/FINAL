# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**Golden Harvest S.A. — Digital Transformation** (UTN Final Project, 2026)
Authors: Cunto Boberg, Tiago & Rojo, Emiliano. Director: Prof. Alberto Cortez.

Backend (`backend/`), frontend (`frontend/`), and n8n are fully wired together — quotes flow from the cart through the backend into n8n, and n8n reads back from the backend API. n8n runs locally as a live instance with real (simulated-data) workflow runs under `n8n/data/`. See `docs/architecture/` for per-layer detail.

## Project Constraints

These govern every design decision in this project, not just documentation:

- **No access to the real company.** This thesis is based on a real company (Golden Harvest S.A.) and its actual website, but the students have no permission or access to the real site, its backend, or any private/production data. All data used in workflows, demos, and testing must be **simulated** (synthetic products, fake leads, mock reviews, placeholder brand assets, etc.) — never assume real credentials, real API access, or real customer data will be available.
- **Zero budget.** The students will not pay for any API keys or paid services. Every workflow/module design must default to free tiers or fully simulated/mocked alternatives (e.g. mock email sending instead of a paid SendGrid tier, simulated PageSpeed scores instead of burning API quota, fake Google Maps reviews instead of live polling with a billed key). When a paid API is the "obvious" choice, note the free/simulated fallback explicitly.
- **n8n is a required, fixed tool** — not swappable, because it's the thesis's core subject. Its known rough edges (in particular the credentials manager being awkward to work with) must be designed around rather than avoided by switching tools: prefer `.env`-file-based or webhook-passed config over the credentials UI where reasonable, and document workarounds in `docs/architecture/n8n.md` as they're discovered.

## Architecture

Decoupled system with three layers:

1. **Frontend (React 19 + TS + Vite)** — Interactive catalog with a "Lead-to-Sale" cart model. The cart does NOT redirect to a payment gateway; instead it submits a quote request to the backend, which saves it to PostgreSQL and fires a webhook to n8n. This is the core architectural decision: consultative sales, not transactional checkout. Feature-based structure under `src/features/` (cart, quote, admin panel). Detail: [`docs/architecture/frontend.md`](docs/architecture/frontend.md).

2. **Backend (Express + Prisma + PostgreSQL, implemented)** — REST API and single source of truth for all data consumed by both the frontend and n8n workflows: products, quotes, customers, orders, interactions, and stats. Location: `backend/`. Detail: [`docs/architecture/backend.md`](docs/architecture/backend.md).

3. **Process Orchestrator (n8n, self-hosted via Docker on port 4343)** — Seven independent automation workflows for marketing, logistics, and CRM, triggered by webhooks from the frontend/backend or schedules. All workflows read data from the backend API (`GH_API_BASE_URL=http://backend:3001/api`). Detail: [`docs/architecture/n8n.md`](docs/architecture/n8n.md).

## n8n Workflow Modules (designed in `docs/architecture/n8n_workflows.md`)

| # | Module | Trigger | n8n reads from backend |
|---|---|---|---|
| 1 | Automated Branding | Monthly / webhook | — |
| 2 | SEO & Performance Monitor | Weekly Mon 08:00 | — |
| 3 | Google Maps Reputation | Poll every 6h | — |
| 4 | Social Media Content Engine | Webhook (new product) | `GET /api/products` |
| 5 | Monthly Activity Report | 1st of month | `GET /api/stats/monthly` |
| 6a | Newsletter Quincenal | Bi-weekly (1st/15th) | `GET /api/mock/newsletter-subscribers` |
| 6b | Carrito Abandonado | Webhook (2h after abandoned cart) | `GET /api/stats/abandoned-carts` |
| 7 | Logistics Automation | Webhook (order confirmed) | `GET /api/orders/:id/items` |

Module 6 ("Lead Nurturing & Cart Interest" in the original design) was split into two independent n8n workflows: **6a** (newsletter, schedule-driven) and **6b** (abandoned-cart follow-up, webhook-driven). See [`docs/architecture/n8n.md`](docs/architecture/n8n.md) for details.

The **Branding module** feeds color data to the **Social Media Content Engine** — this is the only inter-workflow dependency.

## Documentation & Knowledge Base

| Path | Purpose |
|---|---|
| `frontend/` | React app source. |
| `backend/` | Express API source. |
| `n8n/` | Local n8n instance data (SQLite, workflow exports, logs) — runtime data, not documentation. `n8n/workflows/` holds the canonical exported definitions; `n8n/workflows/_archive-*/` folders are point-in-time snapshots kept for reference only, not canonical. |
| `docs/thesis/` | The thesis draft itself. |
| `docs/research/` | Benchmarks, original-site vs. new-site comparisons, raw test data — the source material for Chapters 5–6. **Lighthouse performance data lives in `docs/research/lighthouse/` — re-run it (see that folder's README "Re-running after a frontend change" playbook) any time `frontend/` changes in a way that could move performance/accessibility/SEO scores, so Chapter 5 doesn't go stale.** |
| `docs/assets/` | Graphs, tables, screenshots for insertion into the thesis `.docx`. Generate visuals from `docs/research/` data and save rendered output here. |
| `docs/architecture/` | One file per layer (`frontend.md`, `backend.md`, `n8n.md`), each covering: need, design, what's implemented, and relations to the other layers. `diagram.md` holds the system-wide Mermaid diagrams (target architecture vs. as-built/demo). Read these before making cross-layer changes. |
| `Docs/` (capital D, root) | Pre-existing folder with the UTN thesis template and rubric — binary/reference files, distinct from `docs/`. |

This table mirrors the one in `README.md` — keep both in sync if the layout changes.

## Known Issues

- `frontend/src/components/` duplicates several components (e.g. `Navbar.tsx`) that also exist under `frontend/src/components/layout/`. Not yet resolved — check actual imports before assuming either location is canonical.

## Frontend Commands

```bash
cd frontend
npm install
npm run dev       # Dev server (Vite, HMR) — http://localhost:5173
npm run build     # tsc -b && vite build
npm run preview   # Preview production build
npm run lint      # ESLint
npm run test      # Jest tests
```

## Backend Commands

All commands run from `backend/`:

```bash
npm run dev          # tsx watch src/index.ts — dev server with hot reload
npm run build        # tsc — compile TypeScript
npm run start        # node dist/index.js — run compiled build
npm run db:migrate   # prisma migrate dev
npm run db:generate  # prisma generate — regenerate Prisma client
npm run db:seed      # tsx src/seed.ts
npm run db:studio    # prisma studio — DB browser GUI
```

## n8n Commands

```bash
cd n8n
docker compose up -d      # Start n8n at http://localhost:4343
docker compose down
docker compose logs -f
```

**Port:** 4343. All OAuth/webhook URLs must point to `:4343`.

## Full Stack (Docker)

```bash
docker compose up -d      # Postgres + Backend + n8n
```

## Frontend Stack

- React 19 + TypeScript + Vite 8
- Tailwind CSS v4 with `@theme` (custom --font-heading, --font-body, --color-gold)
- Feature-based architecture under `src/features/`

## Backend Stack

- Express + TypeScript
- Prisma ORM → PostgreSQL
- JWT auth for admin routes
- Zod validation on all endpoints

## Key Files

- `docs/thesis/proposal.md` — Project scope and n8n module descriptions (Spanish, authoritative)
- `docs/thesis/thesis_draft.md` — Full academic thesis draft; Chapters 5 & 6 are pending implementation
- `docs/architecture/n8n_workflows.md` — Detailed n8n workflow designs with JS code snippets for Code Nodes
- `n8n/workflows/*.json` — Exported n8n workflow definitions
- `backend/prisma/schema.prisma` — DB schema
- `docker-compose.yml` — Full stack orchestration
- `Docs/Modelo de Tesis.docx` — UTN thesis template
- `Docs/rubica.docs` — Evaluation rubric

## Lead-to-Sale Flow (Core Business Logic)

```
User browses catalog → adds items to cart → submits quote request
  → POST /api/quotes (backend saves to DB, upserts Customer)
    → backend fires N8N_QUOTE_WEBHOOK
      → n8n notifies sales rep (WhatsApp + Email)
        → sales rep confirms → Quote status → CLOSED → Order created
          → n8n triggers Logistics workflow (PDF label generation)
```

The 2-hour abandoned cart detection runs client-side: if a quote is not submitted within 2 hours of cart activity, the frontend fires a separate webhook (`N8N_ABANDONED_WEBHOOK`) to trigger the **6b. Carrito Abandonado** workflow.

## Development Status

- [x] Proposal defined
- [x] Thesis draft written (Chapters 1–4)
- [x] n8n workflow architecture designed
- [x] React + TS + Vite scaffolded (`frontend/`, feature-based: cart, quote, admin panel)
- [x] Express + Prisma + PostgreSQL backend (`backend/`) — auth, products, quotes, customers, orders, interactions, stats, upload routes implemented
- [x] n8n Docker setup + 7 workflow definitions
- [x] docker-compose full stack (Postgres + Backend + n8n)
- [x] Backend ↔ n8n webhook wiring (quote submit, logistics on order confirm)
- [x] Frontend → Backend connection (QuoteForm via submitQuote())
- [ ] Integration smoke-testing across all 7 workflows against live backend
- [ ] Chapters 5 & 6 of thesis (Results & Conclusions)
