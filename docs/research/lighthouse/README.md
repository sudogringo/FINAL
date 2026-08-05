# Lighthouse baseline audits

Standalone scripts to collect performance/SEO data for thesis Chapter 5 — comparing
the original Golden Harvest S.A. site against the new frontend. Not a workspace member
of `frontend/` or `backend/`; run independently.

## Why Lighthouse CLI (not PageSpeed Insights API)

PSI depends on Google's network/datacenter conditions and gives non-reproducible variance
between runs — a bad basis for a single measurement of the original site. Lighthouse CLI
uses the same underlying engine (same scores as PSI) with a consistent simulated throttling
profile, no quota, no rate limits — safe to re-run against our own site as many times as needed.

## Methodology

- **Original site** (`https://www.goldenharvest.com.ar/silvia`): exactly **one run**, mobile
  + desktop. `run-audit.mjs` refuses `--runs > 1` against any non-localhost URL to avoid
  hammering a site we don't control.
- **New frontend** (`http://localhost:5173` or a preview build): **3 runs**, mobile + desktop,
  median taken across runs for a stable measurement.

## Setup

```bash
cd docs/research/lighthouse
npm install
```

## Usage

```bash
# Original site — single run, both devices
node run-audit.mjs --url=https://www.goldenharvest.com.ar/silvia --label=original --runs=1 --device=both

# New frontend — 3 runs, both devices (make sure `npm run dev` or `npm run preview` is running in frontend/)
node run-audit.mjs --url=http://localhost:5173 --label=new --runs=3 --device=both

# Aggregate everything in results/ into summary.json + summary.csv
node summarize.mjs
```

## Output

Each run writes `results/<label>-<device>[-<run>].json` (full Lighthouse report) and the
matching `.html` (human-readable report, gitignored — regenerate locally if needed).

`summarize.mjs` reads every JSON in `results/` and writes:

- `results/summary.json` — nested by label/device, includes every individual run plus medians.
- `results/summary.csv` — one row per run, long format, ready to import into pandas/Sheets/Excel
  for whatever charts end up in Chapter 5:

  ```
  label,device,run,performance,accessibility,best_practices,seo,lcp_ms,cls,tbt_ms,fcp_ms,speed_index_ms
  ```

It also prints a quick comparison table (median scores + Core Web Vitals per label/device) to
the console as a sanity check.
