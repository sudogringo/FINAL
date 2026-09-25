# n8n workflow runs — current state (2026-09-25)

Standalone scripts that execute each functional n8n workflow a fixed number of times against the
running local stack and record whether each run succeeds. It answers a question the execution
history in `docs/architecture/n8n.md` cannot: **does each workflow work in its current state?**

## Why this exists

Tabla 7 (§5.2.4) reports success/error counts taken from the n8n execution table on 2026-08-04.
Those counts are the **cumulative development history**: they include every failed attempt while
each workflow was being built and debugged, and the per-execution records behind them were not
preserved. They say nothing about the finished workflows. The 2nd-instance review asked
"¿Qué fallaba?" about the four workflows with more errors than successes. These runs measure the
current behaviour instead.

## Protocol

- n8n 2.35.4, container `golden_harvest_n8n`, full stack up (`docker compose up -d` at repo root).
- Each workflow (01–07 except 00, which is measured in `../quote-latency/`) runs **3 times** via
  `n8n execute --id <id> --rawOutput` inside the container, 5 s apart.
- `N8N_RUNNERS_BROKER_PORT=5690` is passed to the CLI process only: the running instance already
  holds the default task broker port (5679), and the CLI refuses to start without its own.
- A run counts as OK only if the CLI exits 0 **and** n8n does not print
  `Execution was NOT successful`. Runs are also saved in n8n's execution table with `mode=cli`.
- **Side effects are real**: the TESIS branches send Gmail messages and write to Google Sheets.

## Results — 2026-09-25, after fixes (current, cited)

All 24 runs OK; `results/summary.csv` and `results/<wf>-<n>.log` hold this batch. Cross-checked
against n8n's execution table (`mode=cli`, `status=success`, 3 per workflow).

| WF | OK / runs | Mean duration |
|---|---|---|
| 01 Automated Branding | 3 / 3 | 9.7 s |
| 02 Website Health & SEO Monitor | 3 / 3 | 153.6 s (PageSpeed audits of the live site) |
| 03 Google Maps Review Management | 3 / 3 | 6.9 s |
| 04 Social Media Content Engine | 3 / 3 | 8.2 s |
| 05 Monthly Activity Report | 3 / 3 | 6.8 s |
| 06a Newsletter Quincenal | 3 / 3 | 6.8 s |
| 06b Carrito Abandonado | 3 / 3 | 6.7 s |
| 07 Logistics & Shipping Automation | 3 / 3 | 6.7 s |

Fixes applied between the two batches (exports in `n8n/workflows/`):

- **02** — trigger rewired to the TESIS PageSpeed branch (`PSI Mobile`); the old
  `Fetch Website Links` chain is left unfed. PSI target changed from the dead
  `tiago-cunto.github.io/golden-harvest/` (404) to `https://sudogringo.github.io/FINAL/`. The
  `Google API Key (PageSpeed)` credential had expired and was renewed.
- **03** — added `Manual Trigger (TESIS)` wired to the same nodes as the Schedule Trigger.
- **05** — HTTP nodes now call `http://backend:3001/api/stats/monthly` and `/api/orders`
  (hardcoded: n8n 2.35 denies `$env` access in expressions); the report Code node maps the
  backend's response shape. Caveat: "Facturación total" is always $0 because backend orders
  carry no prices.

## First batch — 2026-09-25, before fixes (superseded)

| WF | OK / runs | Failure |
|---|---|---|
| 01 Automated Branding | 3 / 3 | — |
| 02 Website Health & SEO Monitor | 0 / 3 | `Fetch Website HTML`: `Invalid URL: undefined` |
| 03 Google Maps Review Management | not run | CLI can't start it (see below) |
| 04 Social Media Content Engine | 3 / 3 | — |
| 05 Monthly Activity Report | 0 / 3 | `GET /stats/monthly — Métricas del mes`: connection cannot be established |
| 06a Newsletter Quincenal | 3 / 3 | — |
| 06b Carrito Abandonado | 3 / 3 | — |
| 07 Logistics & Shipping Automation | 3 / 3 | — |

Per-run detail: `results/summary.csv`; raw CLI output: `results/<wf>-<n>.log`.

### Diagnosed causes (not fixed here)

- **02** — the trigger (`Daily 9 AM Trigger`) is wired to `Fetch Website Links` (disabled) →
  `Attach Config & Timeout` → `Fetch Website HTML`, i.e. the old path, not the TESIS PageSpeed
  branch. The disabled node passes the trigger's empty item through, so `siteUrl` is undefined.
- **03** — its only trigger is a Schedule Trigger; `n8n execute` needs a manual/execute-workflow
  trigger to start from (`Missing node to start execution`). Not a workflow error: run it from the
  editor, or add a Manual Trigger next to the schedule.
- **05** — both HTTP Request nodes still point at `http://golden_harvest_api:8000/...`, a host that
  doesn't exist in the compose stack (the same stale host fixed earlier in workflow 07). The backend
  answers at `http://backend:3001/api/stats/monthly` (`GH_API_BASE_URL`). The GA4 node still carries
  the literal `PROPERTY_ID` placeholder.

## Re-running

```bash
docker compose up -d                           # from repo root
docs/research/n8n-workflow-runs/run-all.sh     # RUNS=3 by default; writes results/ and summary.csv
```
