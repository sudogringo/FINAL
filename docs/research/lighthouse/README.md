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
- **New frontend**: audited against a **production build** served via `vite preview`
  (`http://localhost:4173/FINAL/`), not the dev server — dev-mode is unminified and skips
  prod optimizations, which would understate real performance. **5 runs**, mobile + desktop,
  median taken across runs for a stable measurement (see "Why 5 runs" below).
- All 5 runs for a given device must come from the **same build/commit**. An earlier batch
  (3 runs from 2026-08-04) was discarded and re-run from scratch on 2026-08-06 after a
  frontend commit landed in between and changed real audit results (accessibility 100→83,
  best-practices 96→100) — that was a genuine code-caused step change, not run-to-run noise,
  so mixing both batches into one median would have been methodologically wrong. The old
  batch is kept for reference only under `results/_archive-aug4-build/`, excluded from
  `summarize.mjs`'s median calculation (it only reads `results/*.json` at the top level).

## Why 5 runs, not 1

Lighthouse's `performance` score has real run-to-run variance (simulated throttling, CPU/GC
timing jitter) — a single run is one sample of a random variable, not a ground truth. Category
scores that don't depend on timing (accessibility, best-practices, SEO) are stable across runs
for the same build, as the data below confirms. Reporting the **median of 5 runs** for
`performance` — plus the min–max spread — is standard practice (mirrors what Lighthouse CI
itself recommends) and gives Chapter 5 a defensible answer if asked "why 5 runs and not one?".

## Setup

```bash
cd docs/research/lighthouse
npm install
```

## Re-running after a frontend change (playbook)

**Trigger**: any merged change under `frontend/src/` (or anything else that could move
performance/accessibility/SEO scores) that should be reflected in the thesis data.

Follow these steps in order — do not skip step 1, see "Why archive first" below.

```bash
# 0. From repo root.
cd docs/research/lighthouse

# 1. Archive the current "new" batch before touching anything.
#    Use today's date or the commit hash as the folder suffix.
mkdir -p results/_archive-<date-or-shortsha>
mv results/new-*.json results/new-*.html results/_archive-<date-or-shortsha>/

# 2. Build + preview the frontend (production bundle, NOT the dev server —
#    dev mode is unminified and understates real performance).
cd ../../../frontend
npm run build
npm run preview &        # backgrounds it; serves http://localhost:4173/FINAL/
cd -

# 3. Run 5 fresh audits per device against the SAME build (do not rebuild between runs).
#    run-audit.mjs numbers output files starting at 1 for each invocation and will
#    overwrite results/new-<device>-1.json etc. on every call — so run it once per
#    run instead of once with --runs=5, renaming the output before the next call:
for i in 1 2 3 4 5; do
  node run-audit.mjs --url=http://localhost:4173/FINAL/ --label=new --runs=1 --device=desktop
  mv results/new-desktop.json results/new-desktop-$i.json
  mv results/new-desktop.html results/new-desktop-$i.html
done
for i in 1 2 3 4 5; do
  node run-audit.mjs --url=http://localhost:4173/FINAL/ --label=new --runs=1 --device=mobile
  mv results/new-mobile.json results/new-mobile-$i.json
  mv results/new-mobile.html results/new-mobile-$i.html
done

# 4. Stop the preview server (find and kill the `vite preview` process).

# 5. Aggregate + regenerate charts.
node summarize.mjs
node generate-charts.mjs
```

The original site (`https://www.goldenharvest.com.ar/silvia`) never needs re-running —
it's a one-time, single-run baseline snapshot and stays untouched:

```bash
node run-audit.mjs --url=https://www.goldenharvest.com.ar/silvia --label=original --runs=1 --device=both
```

### Why archive first

All 5 runs in one median **must** come from the same build/commit — Lighthouse's
`performance` score has natural run-to-run variance, but `accessibility`/`best-practices`/
`seo` are stable for a given build and will shift in lockstep the moment the frontend
code actually changes. This happened for real on 2026-08-06: a 3-run batch and a later
2-run batch turned out to be different builds (accessibility 100→83, best-practices
96→100, tracked to specific commits), and mixing them into one "n=5" would have quietly
averaged two different sites together. Archiving the old batch before generating a new
one keeps every set of 5 internally consistent, and keeps the old data around for
before/after comparison instead of silently overwriting it.

### Sanity checks after step 5

- `results/summary.csv` has exactly 5 `new` rows per device, all with plausible,
  non-error scores.
- `accessibility`/`best-practices`/`seo` are identical (or near-identical) across all 5
  runs per device — if they vary run-to-run, something is non-deterministic on the page
  itself (e.g. randomized content), not a measurement artifact.
- `results/summary-medians.csv` — the number to actually cite in Chapter 5 — updated
  and looks in the right ballpark vs. the previous archived batch (a step change is a
  real signal worth reporting, not something to explain away).

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
- `results/summary-medians.csv` — one row per label/device, **the median across all runs** —
  this is the number to cite in the thesis as "the" result, kept separate from the raw
  per-run rows above so it's trivially citable on its own:

  ```
  label,device,n_runs,performance,accessibility,best_practices,seo,lcp_ms,cls,tbt_ms,fcp_ms,speed_index_ms
  ```

It also prints a quick comparison table (median scores + Core Web Vitals per label/device) to
the console as a sanity check.

`generate-charts.mjs` reads `results/summary.csv` and writes two self-contained SVGs (no
charting library, no headless browser — plain string templates) to `docs/assets/`:

- `lighthouse-median-comparison.svg` — median score per category, original vs. new, per device.
- `lighthouse-new-runs-spread.svg` — the 5 individual performance-score runs plotted per device,
  with the median as a dashed reference line — this is the figure that visually justifies
  "why 5 runs" by showing the actual spread.
