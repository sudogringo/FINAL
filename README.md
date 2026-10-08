# Golden Harvest S.A. — Digital Transformation

UTN final project (2026). Authors: Cunto Boberg, Tiago & Rojo, Emiliano. Directores: Prof. Alberto Cortez y Ariel Enferrel.

A decoupled system for a fictionalized digital transformation of Golden Harvest S.A.: an interactive product catalog that produces sales *leads*, not transactions — the cart never redirects to a payment gateway, it fires a webhook to an automation layer (n8n) with a structured quote request for a sales rep to follow up on.

> **Note**: this project is modeled on a real company, but the students have no access to the real site or its data. Everything here — products, leads, reviews — is simulated. See `CLAUDE.md` → Project Constraints for details.

## Architecture

Three layers:

1. **Frontend** — React 19 SPA. Catalog + cart, no checkout.
2. **n8n** — Self-hosted process orchestrator. All business logic (marketing, logistics, social media, reputation) as independent workflows.
3. **Backend** — Express + Prisma + PostgreSQL. Persists the product catalog and quote requests, serves both to the frontend.

```
User browses catalog → adds items to cart → submits quote request
  → backend persists it (POST /api/quotes) and fires the n8n webhook
    → n8n notifies the sales rep by email (TESIS branch; WhatsApp is the disabled PRODUCCIÓN branch)
      → sales rep confirms order
        → workflow 07 composes an HTML dispatch summary (manual trigger;
          PDF delivery notes/labels are the disabled PRODUCCIÓN branch)
```

## Repo layout

| Path | Purpose |
|---|---|
| `frontend/` | React + TS + Vite SPA. See [`docs/architecture/frontend.md`](docs/architecture/frontend.md). |
| `backend/` | Express + Prisma + PostgreSQL API. See [`docs/architecture/backend.md`](docs/architecture/backend.md). |
| `n8n/` | Local n8n instance data (SQLite, workflow exports, logs). `n8n/workflows/*.json` holds the canonical exported definitions — 9 functional workflows (`00`–`07`, with module 6 split into `06a`/`06b`) plus one auxiliary setup workflow. See [`docs/architecture/n8n.md`](docs/architecture/n8n.md). |
| `docs/thesis/` | The thesis draft itself. |
| `docs/research/` | Benchmarks, original-site vs. new-site comparisons, raw test data for Chapters 5–6. Lighthouse toolkit + re-run playbook: [`docs/research/lighthouse/README.md`](docs/research/lighthouse/README.md). |
| `docs/assets/` | Graphs, tables, screenshots for insertion into the thesis document. |
| `docs/architecture/` | Per-layer design docs: need, design, what's implemented, relations to other layers. See [`docs/architecture/diagram.md`](docs/architecture/diagram.md) for the system-wide diagram (target vs. as-built). |
| `docs/official/` | UTN thesis template (`.docx`) and evaluation rubric — reference files, not authored content. |
| `docs/thesis/proposal.md` | Original project proposal and n8n module scope (Spanish, authoritative). |
| `docs/architecture/n8n_workflows.md` | Detailed design for all 7 n8n workflow modules (module 6 shipped as two separate workflows, 6a/6b — see `n8n.md`). |

## Setup (reproducible, full stack)

Everything runs locally with Docker Compose from the repo root. Nothing here
needs a paid service; Gmail and Google Sheets need **your own** Google OAuth
client (free), because no credential is versioned.

### 1. Environment

```bash
cp .env.example .env
```

Fill in `.env` (the root file is the only one Docker Compose reads):

| Variable | Value |
|---|---|
| `JWT_SECRET` | `openssl rand -hex 32` |
| `N8N_ENCRYPTION_KEY` | `openssl rand -hex 32` |
| `SERVICE_API_KEY` | `openssl rand -hex 32` — shared by the backend and n8n; without it workflows 05 and 07 get 401 |
| `N8N_QUOTE_WEBHOOK` | `http://n8n:4343/webhook/quote` (container-to-container; `localhost` would point at the backend itself) |
| `N8N_LOGISTICS_WEBHOOK` | optional — no TESIS workflow listens on it (07 runs from a manual trigger) |
| `SEED_ADMIN_PASSWORD` | optional, 12+ chars; if unset the seed generates one and prints it once |

The per-folder files (`backend/.env`, `frontend/.env`, `n8n/.env`) are only
for running a layer outside Docker with `npm run dev`.

### 2. Start and seed

```bash
docker compose up -d --build                             # Postgres + backend (runs migrations) + n8n
docker exec golden_harvest_backend npm run db:seed       # catalog + admin user
```

API at `http://localhost:3001/api`, n8n at `http://localhost:4343`.

### 3. Import the workflows into n8n

```bash
docker cp n8n/workflows golden_harvest_n8n:/tmp/workflows
docker exec golden_harvest_n8n n8n import:workflow --separate --input=/tmp/workflows
```

### 4. Credentials (n8n UI → Credentials)

Create these three with exactly these names, then open each workflow and
re-select them in the nodes that show a credential warning (imported
workflows reference credential ids from the authors' instance):

| Name | Type | Used by |
|---|---|---|
| `Gmail account` | Gmail OAuth2 | 00–07 |
| `Google Sheets account` | Google Sheets OAuth2 | 04, auxiliary |
| `Google API Key (PageSpeed)` | Query Auth, parameter `key` | 02 |

The OAuth redirect URL is `http://localhost:4343/rest/oauth2-credential/callback`.

### 5. Frontend

```bash
cd frontend && npm install && npm run dev      # http://localhost:5173
```

### Tests

```bash
cd frontend && npm test                        # Jest + React Testing Library
cd backend  && npm test                        # node:test (auth middleware, quote contact, quote closing, seed)
cd n8n      && node --test tests/*.test.mjs    # Code nodes of workflows 02 and 07, run from the exported JSON
```

> `n8n/docker-compose.yml` starts n8n alone, for editing workflows. It does
> not pass `SERVICE_API_KEY` or `N8N_BLOCK_ENV_ACCESS_IN_NODE`, so workflows 05
> and 07 cannot reach the backend from it. Use the root compose for runs.
