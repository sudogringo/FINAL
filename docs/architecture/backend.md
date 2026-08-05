# Backend

## Need

The frontend catalog is "Lead-to-Sale", not transactional — carts don't check out, they produce a quote request. Something has to durably store the product catalog (so it's not hardcoded in the frontend) and the quote requests coming out of the cart, and expose both over HTTP so the frontend and, eventually, n8n workflows (e.g. Logistics Automation) can act on them. That's this layer's whole job: persistence + a thin API, no payment processing, no order fulfillment logic (that lives in n8n).

## Design

- **Express + TypeScript** — minimal, unopinionated HTTP layer; matches the rest of the stack's TS-first approach (frontend is also TS).
- **Prisma ORM + PostgreSQL** — typed schema/migrations over a relational store. Postgres was chosen over MongoDB (mentioned as an alternative in the original 3-layer plan) because the actual data (products, quotes, admins) is structured and relational enough that schema enforcement is more useful than schema flexibility here.
- **JWT auth** (`jsonwebtoken` + `bcryptjs`) for the admin panel — no customer-facing auth exists or is planned; end users are anonymous leads identified only by a `sessionId` on their quote.
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

## Relations

- **Frontend → Backend**: reads the product catalog (`GET /products`), writes quote requests (`POST /quotes`) from the cart, admin panel does full CRUD via JWT-authenticated routes.
- **Backend → n8n**: none currently wired. The intended flow (frontend fires a webhook straight to n8n on quote submit, bypassing the backend) means n8n and the backend don't talk to each other yet — a quote is written to Postgres by the backend *and separately* triggers an n8n webhook from the frontend. There's no current mechanism for n8n's Logistics module to read the quote back out of Postgres; if/when that's built, it'll need either a new backend endpoint n8n calls, or n8n gaining direct DB access (currently avoided — see `docker-compose.yml`, no `depends_on` between the `n8n` and `postgres` services).
- **Backend → Data layer**: owns the only Postgres connection (via `DATABASE_URL`, Prisma). n8n's `docker-compose.yml` service does not currently share this database.

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
