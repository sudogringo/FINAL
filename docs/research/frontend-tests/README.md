# Frontend test suite — source material for Anexo C

Raw output of `npm run test` (Jest) in `frontend/`, for direct citation in Anexo C
("Casos de prueba") of the thesis. Not a workspace member of `docs/research/lighthouse/`
— this is a one-shot capture, not a re-run pipeline, since the test suite itself
(not its variance across runs) is the evidence being cited here.

## How to re-run after a frontend change

```bash
cd frontend
npm run test 2>&1 | tee ../docs/research/frontend-tests/test-run-YYYY-MM-DD.txt
```

Update this README's summary table and the reference in Anexo C if the suite/case
count changes.

## Latest run

| | |
|---|---|
| Date | 2026-10-08 (commit `763f281`) |
| Node | v22.14.0 |
| Command | `npx jest --verbose` in `frontend/` |
| Result | **11 test suites passed, 77 tests passed, 0 failed** |
| Raw output | [`test-run-2026-10-08-verbose.txt`](./test-run-2026-10-08-verbose.txt) |

Earlier runs: 2026-08-07 (verbose, cited in Anexo C of the R34: 10 suites, 70 tests) and
2026-08-06. The 7 new tests (08/10/2026) cover the academic-project notice on the published
site (`AcademicNotice.test.tsx`, 4) and the optional delivery localidad in the quote form
(`QuoteForm.test.tsx`, 3).

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
| Aviso de proyecto académico | `src/__tests__/AcademicNotice.test.tsx` |

Other suites in the repo (not part of this folder): `backend/` runs `node:test` with
`npm test` (auth middleware, quote contact, quote closing, seed admin password), and `n8n/`
runs the Code nodes of workflows 02 and 07 from the exported JSON with
`node --test tests/*.test.mjs`.
