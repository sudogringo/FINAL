# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**Golden Harvest S.A. — Digital Transformation** (UTN Final Project, 2026)
Authors: Cunto Boberg, Tiago & Rojo, Emiliano. Director: Prof. Alberto Cortez.

Backend (`backend/`) and frontend (`frontend/`) are both scaffolded and partially implemented — this is no longer docs-only. n8n runs locally as a live instance with real (simulated-data) workflow runs under `n8n/data/`. See `docs/architecture/` for per-layer detail.

## Project Constraints

These govern every design decision in this project, not just documentation:

- **No access to the real company.** This thesis is based on a real company (Golden Harvest S.A.) and its actual website, but the students have no permission or access to the real site, its backend, or any private/production data. All data used in workflows, demos, and testing must be **simulated** (synthetic products, fake leads, mock reviews, placeholder brand assets, etc.) — never assume real credentials, real API access, or real customer data will be available.
- **Zero budget.** The students will not pay for any API keys or paid services. Every workflow/module design must default to free tiers or fully simulated/mocked alternatives (e.g. mock email sending instead of a paid SendGrid tier, simulated PageSpeed scores instead of burning API quota, fake Google Maps reviews instead of live polling with a billed key). When a paid API is the "obvious" choice, note the free/simulated fallback explicitly.
- **n8n is a required, fixed tool** — not swappable, because it's the thesis's core subject. Its known rough edges (in particular the credentials manager being awkward to work with) must be designed around rather than avoided by switching tools: prefer `.env`-file-based or webhook-passed config over the credentials UI where reasonable, and document workarounds in `docs/architecture/n8n.md` as they're discovered.

## Architecture

The solution is a **decoupled** system with three layers:

1. **Frontend (React 19 + Vite)** — Interactive catalog with a "Lead-to-Sale" cart model. The cart does NOT redirect to a payment gateway; instead it fires a webhook to n8n with a structured quote request. This is the core architectural decision: consultative sales, not transactional checkout. Scaffolded, feature-based structure in progress. Detail: [`docs/architecture/frontend.md`](docs/architecture/frontend.md).

2. **Backend (Express + Prisma + PostgreSQL, implemented)** — Persists the product catalog and quote requests, serves both over a thin REST API. Location: `backend/`. Models (`backend/prisma/schema.prisma`): `Product`, `Quote`, `Admin` (+ `Line`, `QuoteStatus` enums). Routes (`backend/src/routes/`): `auth.ts`, `products.ts`, `quotes.ts`, `upload.ts`. Seed script: `backend/src/seed.ts`. Detail: [`docs/architecture/backend.md`](docs/architecture/backend.md).

3. **Process Orchestrator (n8n, self-hosted via Docker)** — The central automation engine. All business logic (marketing, logistics, social media) runs here as independent, modular workflows. Triggered by webhooks from the frontend or schedules. Detail: [`docs/architecture/n8n.md`](docs/architecture/n8n.md).

## n8n Workflow Modules (designed in `n8n_workflows.md`)

Seven independent subroutines, each designed to be reusable across projects:

| Module | Trigger | Purpose |
|---|---|---|
| Branding / Color Extraction | Monthly schedule or webhook | Extracts brand color palette from site URL; stores to DB for other flows |
| SEO & Performance Monitor | Weekly (Mon 08:00) | Calls PageSpeed API; alerts if scores < 80 |
| Google Maps Reputation | Poll every 6h | Auto-replies positive reviews; escalates negatives to admin |
| Social Media Content Engine | Webhook (new product) or schedule | Generates Stories/Posts for Instagram, TikTok, Facebook via image API + WhatsApp Business |
| Monthly Activity Report | 1st of month | Aggregates GA4 data into PDF/HTML report |
| Lead Nurturing & Cart Interest | Bi-weekly + webhook (2h after abandoned cart) | Sends personalized follow-ups via SendGrid/Postmark |
| Logistics Automation | Webhook (lead confirmed by sales rep) | Generates PDF shipping labels/remitos via PDFMonkey or HTML node |

The **Branding module** feeds color data to the **Social Media Content Engine** — this is the only inter-workflow dependency.

## Key Files

- `proposal.md` — Project scope and n8n module descriptions (Spanish, authoritative)
- `docs/thesis/thesis_draft.md` — Full academic thesis draft; Chapters 5 & 6 are pending implementation
- `n8n_workflows.md` — Detailed n8n workflow designs with JS code snippets for Code Nodes
- `Docs/Modelo de Tesis.docx` — UTN thesis template
- `Docs/rubica.docs` — Evaluation rubric

## Documentation & Knowledge Base

| Path | Purpose |
|---|---|
| `frontend/` | React app source. |
| `backend/` | Express API source. |
| `n8n/` | Local n8n instance data (SQLite, workflow exports, logs) — runtime data, not documentation. |
| `docs/thesis/` | The thesis draft itself. |
| `docs/research/` | Benchmarks, original-site vs. new-site comparisons, raw test data — the source material for Chapters 5–6. |
| `docs/assets/` | Graphs, tables, screenshots for insertion into the thesis `.docx`. Generate visuals from `docs/research/` data and save rendered output here. |
| `docs/architecture/` | One file per layer (`frontend.md`, `backend.md`, `n8n.md`), each covering: need, design, what's implemented, and relations to the other layers. Read these before making cross-layer changes. |
| `Docs/` (capital D, root) | Pre-existing folder with the UTN thesis template and rubric — binary/reference files, distinct from `docs/`. |

This table mirrors the one in `README.md` — keep both in sync if the layout changes.

## Known Issues

- `frontend/src/components/` duplicates several components (e.g. `Navbar.tsx`) that also exist under `frontend/src/components/layout/`. Not yet resolved — check actual imports before assuming either location is canonical.

## Frontend Commands

All commands run from `frontend/`:

```bash
npm run dev       # Dev server (Vite, HMR)
npm run build     # tsc -b && vite build (type-check + bundle)
npm run preview   # Preview production build locally
npm run lint      # ESLint
```

## Frontend Stack

- React 19 + TypeScript
- Vite 8 (bundler)
- ESLint with react-hooks and react-refresh plugins

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

## Development Status

- [x] Proposal defined
- [x] Thesis draft written (Chapters 1–4)
- [x] n8n workflow architecture designed
- [x] React + TS + Vite scaffolded (`frontend/`)
- [x] Express + Prisma + PostgreSQL backend scaffolded (`backend/`) — auth, products, quotes, upload routes implemented
- [ ] React frontend development (in progress; feature-based structure under `features/`)
- [ ] n8n workflow implementation
- [ ] Integration and testing
- [ ] Chapters 5 & 6 of thesis (Results & Conclusions)

## Lead-to-Sale Flow (Core Business Logic)

```
User browses catalog → adds items to cart → submits quote request
  → webhook fires to n8n
    → n8n notifies sales rep (WhatsApp + Email)
      → sales rep confirms order
        → n8n triggers Logistics module (PDF label generation)
```

The 2-hour abandoned cart detection runs client-side: if a quote is not submitted within 2 hours of cart activity, the frontend fires a separate webhook to trigger the Lead Nurturing flow.
