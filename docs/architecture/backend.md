# Backend

## Need

The frontend catalog is "Lead-to-Sale", not transactional — carts don't check out, they produce a quote request. Something has to durably store the product catalog (so it's not hardcoded in the frontend) and the quote requests coming out of the cart, and expose both over HTTP so the frontend and, eventually, n8n workflows (e.g. Logistics Automation) can act on them. That's this layer's whole job: persistence + a thin API, no payment processing, no order fulfillment logic (that lives in n8n).

## Design

- **Express + TypeScript** — minimal, unopinionated HTTP layer; matches the rest of the stack's TS-first approach (frontend is also TS).
- **Prisma ORM + PostgreSQL** — typed schema/migrations over a relational store. Postgres was chosen over MongoDB (mentioned as an alternative in the original 3-layer plan) because the actual data (products, quotes, admins) is structured and relational enough that schema enforcement is more useful than schema flexibility here.
- **JWT auth** (`jsonwebtoken` + `bcryptjs`) for the admin panel — no customer-facing auth exists or is planned; end users are anonymous leads identified only by a `sessionId` on their quote.
- **Service key for n8n**: `GET /orders`, `GET /orders/:id/items`, `GET /stats/monthly` and `GET /stats/abandoned-carts` return customer data, so they require either the admin JWT or the `X-Service-Key` header matching `SERVICE_API_KEY` (`requireAuthOrServiceKey` in `middleware/auth.ts`). Workflows 05 and 07 send that header from `$env.SERVICE_API_KEY`. With `SERVICE_API_KEY` unset, only the JWT path is open.
- **Multer** for image uploads (product photos), stored under `backend/uploads/`.
- **Zod** for request validation at the API boundary.

## Implemented

`backend/prisma/schema.prisma` defines three models:

- **`Product`** — `name`, `line` (enum `Line`: `roja` | `dorada`), `description`, `sizes: String[]`, `tag?`, `stockBySize: Json`, `imageUrl?`, `active`.
- **`Quote`** — `sessionId`, `contact: Json`, `items: Json`, `status` (enum `QuoteStatus`: `PENDING` | `CONTACTED` | `CLOSED`).
- **`Admin`** — `email` (unique), `passwordHash`.

Two migrations applied (`init`, `add_stock`).

Routes under `backend/src/routes/`:

| File | Lines | Purpose |
|---|---|---|
| `auth.ts` | 31 | Admin login, issues JWT |
| `products.ts` | 81 | CRUD for the product catalog |
| `quotes.ts` | 79 | Create/list/update quote requests |
| `upload.ts` | 33 | Product image upload (multer) |

`backend/src/seed.ts` seeds the DB with sample data. `backend/src/middleware/auth.ts` guards admin-only routes.

**Not yet done**: no automated tests for the backend (frontend has Jest tests, backend doesn't); no rate limiting or input sanitization beyond Zod schemas; no connection from n8n into this layer (see Relations).

## Reliable webhook delivery (transactional outbox)

The backend used to call n8n fire-and-forget: if n8n was down at that moment, the notification was lost with no retry. It now uses a **transactional outbox** (`backend/src/webhooks/`):

- **Enqueue.** `POST /api/quotes` writes the customer, the quote and a `WebhookDelivery` row (`quote.created`, key `quote:<id>:created`, target `N8N_QUOTE_WEBHOOK`) in the *same* DB transaction (`routes/quoteCreate.ts`). Closing a quote writes the order and an `order.confirmed` row (key `order:<id>:confirmed`, target `N8N_LOGISTICS_WEBHOOK`) in the same transaction as the stock deduction. Either everything is saved or nothing is. The HTTP response never waits for n8n.
- **Row.** `WebhookDelivery`: `eventType`, `target` (the env var *name*, never the URL), `payload`, `idempotencyKey` (unique), `status` (`PENDING` | `DELIVERED` | `FAILED` | `SKIPPED`), `attempts`, `nextAttemptAt`, `lastError`, `deliveredAt`, `createdAt`. Migration `add_webhook_delivery`.
- **Dispatcher.** An in-process worker (`startDispatcher`, started from `index.ts`, every 5 s) claims due `PENDING` rows with an optimistic lease, POSTs the payload with the `Idempotency-Key` header and a 10 s timeout. 2xx -> `DELIVERED`. Error or non-2xx -> `attempts + 1` and `nextAttemptAt` = 30 s x 2^n (capped at 1 h); after 8 failed attempts -> `FAILED`. Delivery is *at least once*; the key lets the receiver deduplicate.
- **Unset URL.** If the env var named by `target` is empty (n8n local, backend remote), the row is marked `SKIPPED` with `lastError` naming the missing variable. No request is made and nothing crashes. `SKIPPED` rows are not retried automatically.
- **Observability.** `GET /api/webhook-deliveries?status=` (admin JWT or `X-Service-Key`) lists the latest 200 rows.
- **Latency measurement mode.** With `MEASURE_LATENCY=true` the quote route still writes the outbox row but parks it (lease) and sends it inline through the same `attemptDelivery` code, returning n8n's `t1_start`/`t1_end` in the HTTP response as before. If that inline attempt fails the row stays `PENDING` with backoff and the worker retries it. The quote rate limit is disabled in this mode.
- **Limit.** Single-instance design (in-process timer); with several replicas the lease prevents double sends, but the in-memory rate limiter would need a shared store.

## Remote deployment

CORS origins come from `FRONTEND_URL` (comma-separated; localhost is allowed outside production), `PORT` is respected, `trust proxy` is on in production, `GET /api/health` returns `{status, db}`, and `POST /api/quotes` / `POST /api/interactions` are rate limited per IP (in-memory, `middleware/rateLimit.ts`). See [`deploy-remoto.md`](./deploy-remoto.md) and `render.yaml`.

## Relations

- **Frontend → Backend**: reads the product catalog (`GET /products`), writes quote requests (`POST /quotes`) from the cart, admin panel does full CRUD via JWT-authenticated routes.
- **Backend → n8n**: none currently wired. The intended flow (frontend fires a webhook straight to n8n on quote submit, bypassing the backend) means n8n and the backend don't talk to each other yet — a quote is written to Postgres by the backend *and separately* triggers an n8n webhook from the frontend. There's no current mechanism for n8n's Logistics module to read the quote back out of Postgres; if/when that's built, it'll need either a new backend endpoint n8n calls, or n8n gaining direct DB access (currently avoided — see `docker-compose.yml`, no `depends_on` between the `n8n` and `postgres` services).
- **Backend → Data layer**: owns the only Postgres connection (via `DATABASE_URL`, Prisma). n8n's `docker-compose.yml` service does not currently share this database.

See [`docs/architecture/diagram.md`](./diagram.md) for the full system diagram (target vs. as-built).

## Commands

All commands run from `backend/`:

```bash
npm run dev          # tsx watch src/index.ts — dev server with hot reload
npm run build         # tsc — compile TypeScript
npm run start          # node dist/index.js — run compiled build
npm run db:migrate     # prisma migrate dev
npm run db:generate    # prisma generate — regenerate Prisma client
npm run db:seed        # tsx src/seed.ts
npm run db:studio      # prisma studio — DB browser GUI
```
