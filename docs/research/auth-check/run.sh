#!/usr/bin/env bash
# Checks the access control of the backend routes that return customer data.
# Each route is requested three ways: without credentials, with a wrong service
# key and with the configured one (SERVICE_API_KEY from the environment).
# Only HTTP status codes are recorded; the key itself is never printed.
set -u
cd "$(dirname "$0")"
BASE="${BASE:-http://localhost:3001/api}"
: "${SERVICE_API_KEY:?export SERVICE_API_KEY (the same value the backend uses)}"
OUT="results/$(date +%F).csv"
mkdir -p results
echo "route,no_credentials,wrong_key,service_key" > "$OUT"
for route in "orders" "orders?estado=confirmado" "stats/monthly" "stats/abandoned-carts" "products"; do
  a=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/$route")
  b=$(curl -s -o /dev/null -w '%{http_code}' -H "X-Service-Key: wrong-key" "$BASE/$route")
  c=$(curl -s -o /dev/null -w '%{http_code}' -H "X-Service-Key: $SERVICE_API_KEY" "$BASE/$route")
  echo "$route,$a,$b,$c" >> "$OUT"
done
# /orders/:id/items: the auth middleware runs before the query, so a non-existent id is enough
# to check the wiring: 401 without a valid credential, 404 (not 401) with the service key.
id="auth-check-nonexistent-id"
a=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/orders/$id/items")
b=$(curl -s -o /dev/null -w '%{http_code}' -H "X-Service-Key: wrong-key" "$BASE/orders/$id/items")
c=$(curl -s -o /dev/null -w '%{http_code}' -H "X-Service-Key: $SERVICE_API_KEY" "$BASE/orders/$id/items")
echo "orders/:id/items (id inexistente),$a,$b,$c" >> "$OUT"
cat "$OUT"
