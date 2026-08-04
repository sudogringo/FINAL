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
└── __tests__/         — CartDrawer.test.tsx, ProductCard.test.tsx, QuoteForm.test.tsx (Jest)
```

Tests cover the three highest-risk interactive pieces: the cart drawer, product cards, and the quote form.

**Known issue**: `src/components/` contains files (`Navbar.tsx`, `Footer.tsx`, `WhatsAppFab.tsx`, etc.) that are duplicated under `src/components/layout/`. Not yet resolved — check actual imports before assuming either location is canonical.

## Relations

- **Frontend → n8n**: fires a webhook to n8n with a structured quote request on cart submission (no payment gateway redirect); fires a separate webhook after 2 hours of cart inactivity with no submitted quote, to trigger the Lead Nurturing workflow.
- **Frontend ↔ Backend**: reads the product catalog from the backend API; the admin panel (`features/admin/`) performs authenticated CRUD against the backend for products and quote status. Regular (non-admin) quote submission's relationship to the backend vs. the direct n8n webhook is not yet fully reconciled — see `docs/architecture/backend.md` Relations section.
- **Frontend → Data layer**: no direct DB access; always goes through the backend API.

## Commands

All commands run from `frontend/`:

```bash
npm run dev       # Dev server (Vite, HMR)
npm run build      # tsc -b && vite build (type-check + bundle)
npm run preview     # Preview production build locally
npm run lint         # ESLint
```
