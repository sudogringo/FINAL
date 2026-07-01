# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**Golden Harvest S.A. — Digital Transformation** (UTN Final Project, 2026)
Authors: Cunto Boberg, Tiago & Rojo, Emiliano. Director: Prof. Alberto Cortez.

## Architecture

Decoupled system with three layers:

1. **Frontend (React SPA / Vite)** — Interactive catalog with Lead-to-Sale cart. The cart submits a quote request to the backend, which saves it to PostgreSQL and fires a webhook to n8n. Client-side abandoned cart detection triggers a separate webhook 2h after cart activity.

2. **Backend (Express + Prisma + PostgreSQL)** — REST API. Handles products, quotes, customers, orders, interactions, and stats. The single source of truth for all data consumed by both the frontend and n8n workflows.

3. **Process Orchestrator (n8n, self-hosted via Docker on port 4343)** — Seven independent automation workflows for marketing, logistics, and CRM. All workflows read data from the backend API (`GH_API_BASE_URL=http://backend:3001/api`).

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

```bash
cd backend
npm install
npm run dev       # ts-node-dev with hot reload — http://localhost:3001
npx prisma migrate dev   # Run pending migrations
npx prisma db seed       # Seed admin + products
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

## n8n Workflow Modules

| # | Module | Trigger | n8n reads from backend |
|---|---|---|---|
| 1 | Automated Branding | Monthly / webhook | — |
| 2 | SEO & Performance Monitor | Weekly Mon 08:00 | — |
| 3 | Google Maps Reputation | Poll every 6h | — |
| 4 | Social Media Content Engine | Webhook (new product) | `GET /api/products` |
| 5 | Monthly Activity Report | 1st of month | `GET /api/stats/monthly` |
| 6 | Lead Nurturing & Cart Interest | Bi-weekly + webhook | `GET /api/stats/abandoned-carts` |
| 7 | Logistics Automation | Webhook (order confirmed) | `GET /api/orders/:id/items` |

## Key Files

| File | Purpose |
|------|---------|
| `proposal.md` | Project scope (Spanish, authoritative) |
| `thesis_draft.md` | Academic thesis draft |
| `n8n_workflows.md` | Detailed n8n workflow designs |
| `n8n/workflows/*.json` | Exported n8n workflow definitions |
| `backend/prisma/schema.prisma` | DB schema |
| `docker-compose.yml` | Full stack orchestration |

## Lead-to-Sale Flow

```
User adds to cart → submits quote form
  → POST /api/quotes (backend saves to DB, upserts Customer)
    → backend fires N8N_QUOTE_WEBHOOK
      → n8n notifies sales rep (WhatsApp + Email)
        → sales rep confirms → Quote status → CLOSED → Order created
          → n8n triggers Logistics workflow (PDF label generation)
```

2h abandoned cart: if no quote submitted 2h after cart activity, frontend fires `N8N_ABANDONED_WEBHOOK`.

## Development Status

- [x] Frontend React + TS + Vite (feature-based, cart, quote, admin panel)
- [x] Backend Express + Prisma + PostgreSQL (products, quotes, admin auth, upload)
- [x] n8n Docker setup + 7 workflow definitions
- [x] docker-compose full stack
- [ ] Prisma models: Customer, Order, OrderItem, WebInteraction
- [ ] Backend routes: /api/customers, /api/orders, /api/interactions, /api/stats/*
- [ ] Frontend → Backend connection (QuoteForm via submitQuote())
- [ ] Backend → n8n webhook forwarding on quote submit
- [ ] n8n workflows pointing to backend API instead of mock
