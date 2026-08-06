# Golden Harvest S.A. — Digital Transformation

UTN final project (2026). Authors: Cunto Boberg, Tiago & Rojo, Emiliano. Director: Prof. Alberto Cortez.

A decoupled system for a fictionalized digital transformation of Golden Harvest S.A.: an interactive product catalog that produces sales *leads*, not transactions — the cart never redirects to a payment gateway, it fires a webhook to an automation layer (n8n) with a structured quote request for a sales rep to follow up on.

> **Note**: this project is modeled on a real company, but the students have no access to the real site or its data. Everything here — products, leads, reviews — is simulated. See `CLAUDE.md` → Project Constraints for details.

## Architecture

Three layers:

1. **Frontend** — React 19 SPA. Catalog + cart, no checkout.
2. **n8n** — Self-hosted process orchestrator. All business logic (marketing, logistics, social media, reputation) as independent workflows.
3. **Backend** — Express + Prisma + PostgreSQL. Persists the product catalog and quote requests, serves both to the frontend.

```
User browses catalog → adds items to cart → submits quote request
  → webhook fires to n8n
    → n8n notifies sales rep (WhatsApp + Email)
      → sales rep confirms order
        → n8n triggers Logistics module (PDF label generation)
```

## Repo layout

| Path | Purpose |
|---|---|
| `frontend/` | React + TS + Vite SPA. See [`docs/architecture/frontend.md`](docs/architecture/frontend.md). |
| `backend/` | Express + Prisma + PostgreSQL API. See [`docs/architecture/backend.md`](docs/architecture/backend.md). |
| `n8n/` | Local n8n instance data (SQLite, workflow exports, logs). `n8n/workflows/*.json` holds the canonical exported definitions — 8 workflows (module 6 ships as two: `06a`/`06b`). See [`docs/architecture/n8n.md`](docs/architecture/n8n.md). |
| `docs/thesis/` | The thesis draft itself. |
| `docs/research/` | Benchmarks, original-site vs. new-site comparisons, raw test data for Chapters 5–6. |
| `docs/assets/` | Graphs, tables, screenshots for insertion into the thesis document. |
| `docs/architecture/` | Per-layer design docs: need, design, what's implemented, relations to other layers. |
| `Docs/` | UTN thesis template (`.docx`) and evaluation rubric — reference files, not authored content. |
| `docs/thesis/proposal.md` | Original project proposal and n8n module scope (Spanish, authoritative). |
| `docs/architecture/n8n_workflows.md` | Detailed design for all 7 n8n workflow modules (module 6 shipped as two separate workflows, 6a/6b — see `n8n.md`). |

## Setup

Frontend (from `frontend/`):

```bash
npm run dev       # Dev server (Vite, HMR)
npm run build      # Type-check + bundle
```

Backend (from `backend/`):

```bash
npm run dev       # Dev server with hot reload
npm run db:migrate # Apply Prisma migrations
npm run db:seed    # Seed sample data
```

n8n + PostgreSQL (from repo root):

```bash
docker compose up
```

n8n will be available at `http://localhost:4343`.
