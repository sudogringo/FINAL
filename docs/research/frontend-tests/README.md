# Frontend test suite — source material for Anexo D

Raw output of `npm run test` (Jest) in `frontend/`, for direct citation in Anexo D
("Casos de prueba") of the thesis. Not a workspace member of `docs/research/lighthouse/`
— this is a one-shot capture, not a re-run pipeline, since the test suite itself
(not its variance across runs) is the evidence being cited here.

## How to re-run after a frontend change

```bash
cd frontend
npm run test 2>&1 | tee ../docs/research/frontend-tests/test-run-YYYY-MM-DD.txt
```

Update this README's summary table and the reference in Anexo D if the suite/case
count changes.

## Latest run

| | |
|---|---|
| Date | 2026-08-06 |
| Node | v22.14.0 |
| Command | `npm run test` (`jest`) in `frontend/` |
| Result | **10 test suites passed, 70 tests passed, 0 failed** |
| Raw output | [`test-run-2026-08-06.txt`](./test-run-2026-08-06.txt) |

## Suites covered

| Suite | File |
|---|---|
| API client | `src/__tests__/api.test.ts` |
| Carrito (contexto) | `src/__tests__/CartContext.test.tsx` |
| Carrito (drawer UI) | `src/__tests__/CartDrawer.test.tsx` |
| Tarjeta de producto | `src/__tests__/ProductCard.test.tsx` |
| Admin — contexto de auth | `src/__tests__/AdminContext.test.tsx` |
| Admin — productos (webhook configurado) | `src/__tests__/AdminProductsPage.webhookConfigured.test.tsx` |
| Formulario de cotización | `src/__tests__/QuoteForm.test.tsx` |
| Admin — cotizaciones | `src/__tests__/AdminQuotesPage.test.tsx` |
| Admin — login | `src/__tests__/AdminLoginPage.test.tsx` |
| Admin — productos (CRUD) | `src/__tests__/AdminProductsPage.test.tsx` |

Nota para la tesis: no hay suites de backend (Express/Prisma) todavía — el Anexo D
cubre únicamente la cobertura de frontend, que es la única que existe en el repo hoy.
