# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**Golden Harvest S.A. — Digital Transformation** (UTN Final Project, 2026)
Authors: Cunto Boberg, Tiago & Rojo, Emiliano. Director: Prof. Alberto Cortez.

This repository currently contains only planning and academic documentation. No application code exists yet.

## Planned Architecture

The solution is a **decoupled** system with three layers:

1. **Frontend (React SPA / Next.js)** — Interactive catalog with a "Lead-to-Sale" cart model. The cart does NOT redirect to a payment gateway; instead it fires a webhook to n8n with a structured quote request. This is the core architectural decision: consultative sales, not transactional checkout.

2. **Process Orchestrator (n8n, self-hosted via Docker)** — The central automation engine. All business logic (marketing, logistics, social media) runs here as independent, modular workflows. Triggered by webhooks from the frontend or schedules.

3. **Data Layer (PostgreSQL / MongoDB)** — Stores leads, brand configurations, and product catalog data consumed by n8n workflows.

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
- `thesis_draft.md` — Full academic thesis draft; Chapters 5 & 6 are pending implementation
- `n8n_workflows.md` — Detailed n8n workflow designs with JS code snippets for Code Nodes
- `Docs/Modelo de Tesis.docx` — UTN thesis template
- `Docs/rubica.docs` — Evaluation rubric

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

## Development Status

- [x] Proposal defined
- [x] Thesis draft written (Chapters 1–4)
- [x] n8n workflow architecture designed
- [x] React + TS + Vite scaffolded (`frontend/`)
- [ ] React frontend development
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
