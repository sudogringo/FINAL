# Resilience scenario (d): PostgreSQL unavailable during a quote request

Run on 2026-10-01 against the local Docker Compose stack (`golden_harvest_backend`, `golden_harvest_db`).

## Procedure

1. Start the stack and wait until `GET /api/products` answers `200`.
2. Stop the database: `docker stop golden_harvest_db`.
3. Send a valid quote request:
   ```bash
   curl -s -w ' http=%{http_code}\n' -X POST http://localhost:3001/api/quotes \
     -H 'Content-Type: application/json' \
     -d '{"sessionId":"resil-test","contact":{"nombre":"Prueba Resiliencia","email":"resiliencia@example.test"},"items":[{"id":"x","name":"Doble Concentrado","line":"Roja","size":"1kg","qty":1}]}'
   ```
4. Check that the backend process survived: `docker inspect golden_harvest_backend --format '{{.RestartCount}}'`.
5. Start the database again and repeat step 3.

## Results

| Step | Before the fix (`quotes.ts` without error handling) | After the fix |
|---|---|---|
| 3. Request with the database down | No HTTP response (`curl` exit 52, empty reply). The unhandled Prisma rejection crashed the process. Docker restarted it (`RestartCount` 147 → 148). | `503` with `{"error":"No se pudo registrar la solicitud. Intentá de nuevo en unos minutos."}`, twice in a row. |
| 4. Backend process | Restarted by Docker (`restart: unless-stopped`). | Still running, `RestartCount` 0. |
| Payload validation with the database down | — | `400`: Zod validation does not depend on the database. |
| 5. Same request after the database returns | — | `201`, served by the same process (no restart). |

No webhook is fired when persistence fails: with no stored quote there is nothing to notify. The user retries manually; there is no automatic retry on the backend side.

Scope: the fix covers the public `POST /api/quotes` route. The admin routes (`GET`/`PATCH` on quotes, orders, stats, etc.) still have no error handling around Prisma calls. A database outage while an admin is using the panel can still crash the process until Docker restarts it.
