# Pruebas E2E (Playwright)

Pruebas de extremo a extremo del flujo Lead-to-Sale con [Playwright](https://playwright.dev) (MIT, gratuito), solo Chromium headless. Paquete independiente: no forma parte de las dependencias de `frontend/`.

## Cómo correrlas

Requisitos: el backend local levantado en `http://localhost:3001` con datos de ejemplo (`docker compose up -d`, contenedor `golden_harvest_backend`).

```bash
cd e2e
npm install
npx playwright install chromium   # una sola vez
npm test
```

`playwright.config.ts` compila el frontend en modo producción (`npm run build`, el mismo artefacto que se publica en GitHub Pages) con `VITE_API_URL=http://localhost:3001` y lo sirve con `vite preview` en `http://localhost:4180/FINAL/`. Variables opcionales: `E2E_API_URL` (otra URL de backend) y `E2E_PORT` (otro puerto de preview).

## Qué prueba cada escenario

| # | Archivo | Qué demuestra |
|---|---|---|
| 1 | `tests/lead-to-sale.spec.ts` | En `/catalogo` filtran la línea y la búsqueda (incluido el estado sin resultados), se agregan 3 variedades con su presentación, el carrito las lista y permite aumentar/reducir cantidad (el contador del navbar acompaña). |
| 2 | `tests/lead-to-sale.spec.ts` | Se completa y envía la cotización con datos sintéticos (`@example.test`): el backend responde **201** con un `id`, el payload contiene los 3 ítems y el contacto, y la UI muestra "¡Cotización enviada!". |
| 2b | `tests/lead-to-sale.spec.ts` | Un email inválido bloquea el envío y no se llama al backend. |
| 3 | `tests/navigation.spec.ts` | La carga directa de `/FINAL/catalogo` muestra el catálogo (deep link). |
| 4 | `tests/a11y.spec.ts` | `@axe-core/playwright` (WCAG 2.0/2.1 A y AA) sobre `/` y `/catalogo`: 0 violaciones `serious`/`critical`. |

## Por qué corren en local y no en CI

El escenario 2 necesita el backend con PostgreSQL y el catálogo (escenarios 1-4) lee productos de ese backend, así que las E2E corren contra el stack local de staging, no contra el sitio publicado ni en GitHub Actions (que no levanta el backend). El workflow de despliegue sí ejecuta `lint` y el build; las pruebas unitarias (Jest) cubren la lógica sin backend.

Cada ejecución de los escenarios 2 crea una cotización sintética en la base local. La verificación se hace con la respuesta 201 capturada (`waitForResponse`) y la UI de éxito, porque leer `GET /api/quotes` exige el JWT de administrador.

Una corrida archivada está en `docs/research/e2e-tests/`.
