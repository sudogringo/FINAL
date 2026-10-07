# Thesis Promises & Deliverables — Golden Harvest S.A.
**Source**: `Tesis_Cunto_Rojo_GoldenHarvest_FINAL_v2.pdf` (56 pages)
**Audited**: 2026-06-23

---

## ⚠️ CRITICAL DISCLAIMER (stated in the thesis itself)

- All quantitative results were measured in a **staging environment**, not production.
- Production deployment was **projected for May 31, 2026** (status: Pending at time of writing).
- Usability testing used only n=5 participants.
- Baseline metrics (e.g., 8–12 min for remito generation) were self-reported verbally by staff, not directly measured.

---

## 1. n8n Workflows

The thesis describes **4 automation modules** (not 7 as in `n8n_workflows.md`).

---

### Module 1 — Motor de Procesamiento de Leads

**Trigger**: HTTP POST webhook from the React `QuoteForm`. Authenticated via `X-API-Key` header (256-bit key).

**Node sequence**:
1. **Validation Node** — checks JSON payload structure, rejects missing required fields
2. **Enrichment Node** — calculates estimated order value, classifies lead priority (High/Medium/Low), adds session metadata
3. **PostgreSQL INSERT** — persists lead to `leads` table (client fields, product detail as JSONB, metadata)
4. **Split Node** — parallel branches: vendor notification + client confirmation
5. **Vendor Branch** — email via SMTP with full order detail + WhatsApp Business executive summary
6. **Client Branch** — personalized confirmation email with request number and estimated response time + WhatsApp acknowledgment

**Claimed performance** (staging, n=50):
- Average end-to-end: **8.3 seconds** (acceptance threshold: 15s)
- Min 6.1s / Max 14.8s
- 100% success, 100% PostgreSQL persistence, 100% vendor emails, 100% client emails, 98% WhatsApp (1 failure = external API latency)

---

### Module 2 — Motor de Redes Sociales (SMCE)

**Trigger**: Cron (at peak engagement hours per platform), manual webhook, or triggered by product catalog update.

**Node sequence**:
1. Cron Trigger (or Webhook for manual)
2. **MongoDB Read** — brand visual identity (palette, logo, typography) + content template
3. **PostgreSQL Read** — selects product(s) to feature (rotation + stock criteria)
4. **HTTP Request → Image Generation API** — generates graphics: Post 1080×1080px (Instagram/Facebook), Story 1080×1920px
5. **Code Node (JS)** — generates post copy adapted to each channel's tone
6. **Meta Graph API Node** — publishes to Instagram and Facebook
7. **HTTP Request → TikTok for Business API** — publishes to TikTok

**Claimed results**: Content generated and published to Instagram, Facebook, and TikTok test account. Visual quality rated "acceptable" 85% / "good" 15% / 0% "unsatisfactory" by marketing manager.

---

### Module 3 — Sistema de Omnicanalidad para Notificaciones

**Trigger**: Events from other modules (new lead, quotation sent, order confirmed, shipment dispatched).

**Behavior**: Centralized messaging orchestrator. Reads message templates from MongoDB, constructs per-channel messages, routes delivery through email (SMTP) and WhatsApp Business. Ensures consistent tone across all notifications.

---

### Module 4 — Sistema de Automatización Logística

**Trigger**: Sales team approves a quotation and registers order confirmation.

**Behavior**:
- Generates PDFs using **PDFKit** library in a Function node (Node.js runtime inside n8n):
  - **Remito de despacho** (shipping invoice with full order detail)
  - **Etiquetas de identificación de bultos** (package labels)
  - **Reporte de actividad comercial del período** (periodic commercial activity report)
- Stores PDFs on server
- Emails PDFs as attachments to the logistics manager

**Claimed performance** (staging, n=20):
- 100% correct PDF generation
- Average time: **4.1 seconds** (vs. 8–12 minutes manually = **95% reduction**)
- Projected savings: 4–6 hours of admin work/month

---

## 2. Frontend / UI Promises

**Technology stack claimed**:
- React 18 + Next.js 14, Tailwind CSS v3, Zustand 4, shadcn/ui, react-hook-form + Zod

**Component architecture** (Atomic Design, 3 levels):
- Page: `HomePage`, `CatalogoPage`, `ProductoDetallePage`, `ContactoPage`
- Section: `HeroSection`, `ProductGrid`, `CartDrawer`, `QuoteForm`, `TestimonialsSection`, `FooterSection`
- Atomic: `ProductCard`, `CategoryBadge`, `QuantitySelector`, `PriceTag`, `FormInput`, `SubmitButton`

**Features claimed as implemented**:
- Mobile-First responsive (breakpoints: sm 640px, md 768px, lg 1024px, xl 1280px)
- Product catalog with client-side filtering (category), text search, sorting by price/popularity — all local in Zustand state (zero network latency)
- Product data loaded at build time via Next.js SSG or initial API call
- Shopping cart ("Lead-to-Sale" model): add products + quantities → QuoteForm
- QuoteForm fields: `nombre` (required), `empresa` (optional), `telefono` (regex-validated), `email`, `notas` (max 500 chars, optional)
- On submit: HTTP POST JSON to `NEXT_PUBLIC_N8N_WEBHOOK_URL` env var → clears cart on success
- No payment gateway — explicitly Lead-to-Sale only
- Lazy loading via Next.js `Image` component
- Static route generation via SSG
- Automatic code splitting

**Claimed Google Lighthouse scores** (staging):

| Metric | Old site mobile/desktop | New catalog mobile/desktop |
|--------|------------------------|---------------------------|
| Performance | 31 / 48 | **94 / 98** |
| Accessibility | 58 / 61 | 97 / 98 |
| Best Practices | 50 / 67 | 92 / 96 |
| SEO | 44 / 52 | 96 / 98 |
| LCP | 8.4s / 5.2s | **1.8s / 1.2s** |
| INP | 580ms / 210ms | 120ms / 60ms |
| CLS | 0.42 / 0.28 | 0.04 / 0.02 |

**Usability test** (n=5): 100% task completion, avg 4m40s, 4.4/5 ease-of-use. 2 errors (same issue: "Add to cart" vs. "View details" confusion on ProductCard at 320px — fixed in S9).

---

## 3. Backend / Infrastructure Promises

**4-layer architecture claimed as implemented**:

- **Layer 1** — Presentation (React/Next.js): no persistent storage, communicates only via HTTPS to n8n webhooks
- **Layer 2** — Orchestration (n8n v1.x self-hosted, Docker): receives webhook events, runs Cron flows
- **Layer 3** — Storage:
  - **PostgreSQL 16**: leads, quote history, product inventory, user config
  - **MongoDB 7**: social media templates, brand visual identity configs, cached API responses
- **Layer 4** — Infrastructure (Docker Compose + Nginx): all services declared in `docker-compose.yml`; Nginx handles SSL/TLS via Let's Encrypt + certbot

**Deployment target claimed**: AWS EC2 t3.medium, us-east-1, 1 Gbps connection.

**Security measures claimed**:
- Webhook: `X-API-Key` header, 256-bit entropy, stored as env var, rotated periodically, HTTP 401 on failure
- Input sanitization: Zod client-side + Module 1 text field sanitization before DB persistence
- All credentials managed via Docker Compose env vars, never in source code
- CORS restricted to production frontend domain
- HTTPS with Let's Encrypt / certbot auto-renewal
- Personal data (name, email, phone) in PostgreSQL, restricted access, not shared beyond defined notification channels

---

## 4. External Integrations Claimed

| Service | Module(s) | Purpose |
|---------|-----------|---------|
| WhatsApp Business API | 1, 3 | Vendor alerts, client confirmations |
| Meta Graph API (Instagram) | 2 | Post + Story publishing (1080×1080, 1080×1920px) |
| Meta Graph API (Facebook) | 2 | Post + Story publishing |
| TikTok for Business API | 2 | Content publishing |
| SMTP (email) | 1, 3, 4 | All email notifications and doc delivery |
| Image Generation API | 2 | Brand graphic asset generation (provider unnamed) |
| Google Lighthouse / PageSpeed Insights | Diagnostic only | Pre-existing site audit baseline |

**Explicitly NOT included**: Google Analytics, ERP, electronic invoicing, payment gateways, real-time inventory, CRM, third-party logistics.

---

## 5. Testing Claims

- **Jest 29 + React Testing Library**: unit tests for `ProductCard`, `CartDrawer`, `QuoteForm`
- **Playwright 1.x E2E**: catalog navigation + filtering; cart add/modify; quote form submit
- **n8n integrated test runner**: synthetic payloads per module (nominal + edge cases)
- **Resilience tests**: high API latency (n8n Wait node), webhook timeout, malformed JSON, PostgreSQL unavailability — all verified to log error and recover without data loss
- **ESLint 8 + Prettier 3** for static analysis
- **GitHub Flow** branching strategy

---

## 6. Development Process Claims

10 two-week Scrum sprints (S1–S10), Jan–May 2026:

| Date | Milestone | Status |
|------|-----------|--------|
| 01/01/2026 | Project start | ✅ Completed |
| 15/01/2026 | Technical audit + interviews | ✅ Completed |
| 01/02/2026 | UI/UX design approved by client | ✅ Completed |
| 01/03/2026 | Functional React catalog (staging) | ✅ Completed |
| 15/03/2026 | n8n stack + Docker infrastructure | ✅ Completed |
| 01/04/2026 | Module 1 (Lead Engine) validated | ✅ Completed |
| 15/04/2026 | Module 2 (Social Media Engine) validated | ✅ Completed |
| 30/04/2026 | Modules 3–4 (Omnichannel + Logistics) validated | ✅ Completed |
| 15/05/2026 | End-to-end integration + final tests | ✅ Completed |
| 28/05/2026 | Thesis presentation | 🔄 In progress |
| 31/05/2026 | Production deployment | ⏳ Pending |

---

## 7. ❗ Critical Gap: Thesis vs. Actual Repository

| Thesis Claims | Actual State (Repo) |
|---------------|---------------------|
| PostgreSQL 16 + MongoDB 7 | n8n uses **SQLite** (default Docker setup) |
| AWS EC2 t3.medium deployment | Running on **localhost:4343** |
| 4 validated modules | Workflows exist but are **inactive** |
| React + Next.js 14 | Frontend is **React + Vite** (not Next.js) |
| Playwright E2E tests | No Playwright config in repo |
| Jest unit tests for React | Not confirmed in repo |
| Full Instagram/Facebook/TikTok integration | Partially configured; OAuth/webhooks point to localhost |
| Image generation API integrated | Unknown which API; not confirmed in workflows |
| 10 completed Scrum sprints (Jan–May 2026) | No sprint tracking found in repo |

> **Bottom line**: The thesis describes a substantially more complete system than what exists in the repository. The most significant fabrications are the database architecture (PostgreSQL+MongoDB vs. SQLite), the deployment environment (AWS vs. localhost), and the testing infrastructure (Jest+Playwright vs. none confirmed).
