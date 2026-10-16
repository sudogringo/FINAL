# backend-tests

Salidas completas de las corridas del backend (node:test vía tsx).

- Comando: `cd backend && npm test`
- `test-run-2026-10-09.txt`: 35 pruebas, 35 pasan.
- `test-run-2026-10-10.txt`: 41 pruebas, 41 pasan. Agrega las 6 del manejador global de errores (commit 1160db4): estados 4xx propios del error, P2002 → 409, mensaje por estado y un cuerpo JSON malformado que responde 400.

## Corrida del 16/10/2026

- Archivo: `test-run-2026-10-16.txt` (`cd backend && npm test`).
- Resultado: 72 pruebas, 72 pasan (incluye el outbox de webhooks, el límite de tasa, CORS y /api/health, agregados el 14/10).
