# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

University capstone thesis (UTN Sem 4) implementing a digital transformation for **Golden Harvest S.A.**, an Argentine agricultural company. The project has two main deliverables:
1. A React/Vite frontend (lives on `main` branch, deployed to GitHub Pages)
2. Seven n8n automation workflows for marketing, logistics, and CRM

> The `n8n-social` branch contains only n8n work. The `main` branch has both the frontend and n8n config.

## Frontend (React + Vite + Tailwind)

Located in `frontend/`. Stack: React 19, TypeScript, Tailwind CSS v4, Vite. Deployed to GitHub Pages via `.github/workflows/deploy.yml`.

```bash
cd frontend
npm install
npm run dev       # Dev server
npm run build     # tsc -b && vite build
npm run lint      # ESLint
npm run preview   # Preview production build
```

Components in `frontend/src/components/`: `Navbar`, `Hero`, `About`, `ProductLines`, `Production`, `Certifications`, `Contact`, `Footer`, `WhatsAppFab`.

## n8n Local Instance

The only runnable component is the n8n Docker instance:

```bash
cd n8n
docker compose up -d      # Start n8n at http://localhost:4343
docker compose down       # Stop
docker compose logs -f    # Follow logs
```

Workflows and credentials are stored in `n8n/data/` (SQLite, gitignored). The `.env` file holds `N8N_ENCRYPTION_KEY` and other config — never commit it.

**Port:** 4343 (not n8n's default 5678 — all OAuth/webhook URLs must point to `:4343`).

## Seven Automation Workflows

Detailed design lives in `n8n_workflows.md`. All 7 workflows exist in n8n (created but inactive):

1. Automated Branding — extract site colors for dynamic assets
2. Website Health & SEO Monitor — recurring performance checks
3. Google Maps Review Management — monitor and respond to reviews
4. Social Media Content Engine — auto-generate Instagram/WhatsApp stories
5. Monthly Activity Report — GA4 traffic/behavior summary
6. Lead Nurturing & Cart Interest — abandoned cart + newsletter flows
7. Logistics & Shipping Automation — label/doc generation post-order

## Key Files

| File | Purpose |
|------|---------|
| `proposal.md` | Full project proposal (Spanish) — source of truth for scope |
| `GEMINI.md` | English project overview |
| `thesis_draft.md` | Academic thesis structure (8 chapters) |
| `n8n_workflows.md` | Detailed workflow design for all 7 automations |
| `n8n/docker-compose.yml` | n8n service definition |
| `n8n/.env` | Runtime secrets (gitignored) |

## n8n API Access

Claude can read and update workflows directly via the n8n REST API without manual import/export.

**Base URL:** `http://localhost:4343/api/v1`  
**Auth header:** `X-N8N-API-KEY: <key from n8n/.env or user>`

### Key endpoints
```
GET  /workflows          # list all workflows
GET  /workflows/{id}     # read a workflow
PUT  /workflows/{id}     # update a workflow (body = workflow JSON)
POST /workflows          # create a workflow
```

### PUT quirks (fields to strip before sending)
The API rejects these fields as read-only or invalid:
- `id`, `active`, `isArchived`, `meta`, `tags`
- `description` must be a string (convert `null` → `""`)
- `settings.binaryMode` is not in the public schema — remove it

Use Python `urllib.request` (not curl/wget — blocked by hook). Pattern:
```python
import json, urllib.request
data.pop('id', None); data.pop('active', None); ...  # strip read-only fields
req = urllib.request.Request(url, data=json.dumps(data).encode(), method="PUT",
      headers={"X-N8N-API-KEY": KEY, "Content-Type": "application/json"})
with urllib.request.urlopen(req) as r: result = json.load(r)
```

**Workflow IDs** (n8n internal IDs, needed for API calls):
| File | n8n ID |
|------|--------|
| WF1_updated.json | `Yvoc3v8PN45TaRAD` |

> Add other IDs here as discovered via `GET /workflows`.

## Architecture Notes

- n8n data is fully self-contained in `n8n/data/` — to migrate to another machine, copy that directory and the `.env` file
- No root-level Node.js project; n8n is purely containerized
- `test.http` contains HTTP test requests for workflow webhooks
