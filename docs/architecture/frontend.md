# Frontend

## Need

Golden Harvest sells through a consultative sales process, not e-commerce — a visitor should be able to browse the catalog and build a cart, but the "checkout" is a quote request that a human sales rep follows up on, not a payment. The frontend's job is to make that catalog browsing and cart-to-quote flow feel as smooth as a normal storefront, while never touching payment processing, and to kick off the automation layer (n8n) at the two moments that matter: quote submission and cart abandonment.

## Design

- **React 19 + TypeScript + Vite** — SPA, fast HMR dev loop, static build deployable to GitHub Pages (see `.github/workflows/deploy.yml`).
- **Feature-based folder structure** under `src/features/` (`cart`, `quote`, `products`, `admin`) rather than type-based (`components/`, `hooks/`, etc.) — keeps everything needed to understand one piece of business logic (e.g. the cart) in one place, each with its own `components/` subfolder and, where needed, a Context (`CartContext.tsx`, `AdminContext.tsx`) for state.
- **Client-side abandoned-cart timer**: the 2-hour abandoned-cart detection runs entirely in the browser — if a quote isn't submitted within 2 hours of cart activity, the frontend fires a separate webhook itself. No backend/n8n polling involved.

## Implemented

```
frontend/src/
├── features/
│   ├── cart/       — CartContext.tsx + components (cart state, quote submission)
│   ├── quote/       — quote request form components
│   ├── products/     — product catalog display components
│   └── admin/         — AdminContext.tsx + api.ts + components (admin panel: login, product CRUD)
├── pages/            — HomePage, CatalogoPage, ContactoPage, admin/AdminLoginPage, admin/AdminProductsPage
├── routes/AppRouter.tsx
├── data/products.ts
└── __tests__/         — 10 suites, 70 tests (Jest + Testing Library) — see Testing below
```

### Testing

Jest + `jsdom` + React Testing Library, run from `frontend/` with `npm run test`. As of 2026-08-06: **10 suites / 70 tests, all passing**, coverage **74.71% statements / 68.62% branches / 72.07% functions / 78.47% lines**.

| Suite | Covers |
|---|---|
| `ProductCard.test.tsx` | Render, size selection, quantity limits, sold-out/at-stock-cap branches |
| `CartDrawer.test.tsx` | Drawer open/close, item display, empty state |
| `CartContext.test.tsx` | Reducer: stock-capped `addItem`, `setQty` (incl. remove-on-zero and cap), `removeItem`, `clearCart`, `totalItems`, open/close toggles, and the 2-hour abandoned-cart webhook timer (via `jest.useFakeTimers()`) |
| `QuoteForm.test.tsx` | Modal open/close, Zod validation (name, email, notes length) |
| `api.test.ts` | `submitQuote`, `adminLogin`, `fetchMonthlyStats`, and `logInteraction`'s fire-and-forget behavior (never rejects even on network failure) |
| `AdminContext.test.tsx` | Login/logout persist to and clear `localStorage`, `isAuthenticated` derivation |
| `AdminLoginPage.test.tsx` | Submit → `adminLogin`, success navigates + stores token, failure shows error and doesn't navigate |
| `AdminQuotesPage.test.tsx` | `NEXT_STATUS` state machine (PENDING→CONTACTED→CLOSED), `window.confirm`-gated close |
| `AdminProductsPage.test.tsx` + `AdminProductsPage.webhookConfigured.test.tsx` | Create/edit/delete/restore CRUD, search/line/status filtering, `triggerSocialMedia()` webhook call and its unset-webhook alert fallback |

Known gaps (not yet covered): most of `admin/api.ts`'s remaining CRUD endpoints (`fetchQuotes`, `updateQuoteStatus`, `uploadImage`, `fetchAllProductsAdmin`, `updateProduct`), `ProductFormModal.tsx`, `AdminLayout.tsx`, `ProductList.tsx`. `jest.config.js` needed a `TextEncoder`/`TextDecoder` polyfill (`__tests__/jest.setup.ts`) added for suites importing real `react-router-dom`, since `jest-environment-jsdom` doesn't provide those globals.

**Known issue**: `src/components/` contains files (`Navbar.tsx`, `Footer.tsx`, `WhatsAppFab.tsx`, etc.) that are duplicated under `src/components/layout/`. Not yet resolved — check actual imports before assuming either location is canonical.

## Relations

- **Frontend → n8n**: fires a webhook to n8n with a structured quote request on cart submission (no payment gateway redirect); fires a separate webhook after 2 hours of cart inactivity with no submitted quote, to trigger the Lead Nurturing workflow.
- **Frontend ↔ Backend**: reads the product catalog from the backend API; the admin panel (`features/admin/`) performs authenticated CRUD against the backend for products and quote status. Regular (non-admin) quote submission's relationship to the backend vs. the direct n8n webhook is not yet fully reconciled — see `docs/architecture/backend.md` Relations section.
- **Frontend → Data layer**: no direct DB access; always goes through the backend API.

See [`docs/architecture/diagram.md`](./diagram.md) for the full system diagram (target vs. as-built).

## Commands

All commands run from `frontend/`:

```bash
npm run dev       # Dev server (Vite, HMR)
npm run build      # tsc -b && vite build (type-check + bundle)
npm run preview     # Preview production build locally
npm run lint         # ESLint
```
