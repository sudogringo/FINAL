# Access control check of the API routes with customer data

`run.sh` requests each route three ways (no credentials, a wrong `X-Service-Key`, the configured
`SERVICE_API_KEY`) against the running backend and records only the HTTP status codes in
`results/<date>.csv`. The key itself is never written.

```bash
docker compose up -d                       # with SERVICE_API_KEY set in .env
SERVICE_API_KEY=<same value> docs/research/auth-check/run.sh
```

Expected: `401,401,200` for `/orders`, `/stats/monthly` and `/stats/abandoned-carts`; `200` in the
three columns for the public `/products`. `/orders/:id/items` is requested with a non-existent id:
the middleware runs before the query, so `401,401,404` shows that the route is protected and that
the service key passes it.

The unit tests of the middleware itself are in `backend/src/middleware/auth.test.ts` (`npm test` in
`backend/`).
