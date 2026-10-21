# backend-tests

Salidas completas de las corridas del backend (node:test vía tsx).

- Comando: `cd backend && npm test`
- `test-run-2026-10-09.txt`: 35 pruebas, 35 pasan.
- `test-run-2026-10-10.txt`: 41 pruebas, 41 pasan. Agrega las 6 del manejador global de errores (commit 1160db4): estados 4xx propios del error, P2002 → 409, mensaje por estado y un cuerpo JSON malformado que responde 400.

## Corrida del 16/10/2026

- Archivo: `test-run-2026-10-16.txt` (`cd backend && npm test`).
- Resultado: 72 pruebas, 72 pasan (incluye el outbox de webhooks, el límite de tasa, CORS y /api/health, agregados el 14/10).

## Segunda corrida del 20/10/2026

- Archivo: `test-run-2026-10-20b.txt` (`cd backend && npm test`).
- Resultado: 78 pruebas, 78 pasan. Agrega una a `quoteContact.test.ts`: el contacto que arma el arnés de
  VD2 (`docs/research/quote-latency/fixtures.mjs`) tiene que pasar el esquema del endpoint. Desde
  `5f631b4` el backend exige `consentimiento`, y el arnés no lo enviaba: todas sus corridas terminaban en 400.

## Corrida del 21/10/2026

- Archivo: `test-run-2026-10-21.txt` (`cd backend && npm test`).
- Resultado: 80 pruebas, 80 pasan. Agrega dos a `health.test.ts`: `/api/health` informa el commit
  desplegado (los siete primeros caracteres de `RENDER_GIT_COMMIT`, que Render define en cada deploy),
  también cuando la base no responde. Sin esa variable, la respuesta no cambia.
