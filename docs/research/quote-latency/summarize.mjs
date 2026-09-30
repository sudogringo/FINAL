// Reads every results/batch-*/run-*.json, computes median/min/max/p95, mean and
// sample standard deviation of endToEndLatencyMs, plus an exact (Clopper-Pearson)
// 95% confidence interval for the failure rate, and contrasts the median against
// the ≤15s design criterion (§3.2).
// Mirrors docs/research/lighthouse/summarize.mjs's structure.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = path.join(__dirname, 'results');
const CRITERION_MS = 15000;

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(sorted.length - 1, idx))];
}

function mean(values) {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

// Sample standard deviation (n − 1 denominator).
function sampleStdDev(values) {
  if (values.length < 2) return null;
  const m = mean(values);
  return Math.sqrt(values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1));
}

function binomialCdf(k, n, p) {
  // P(X ≤ k) for X ~ Binomial(n, p), accumulated term by term.
  if (k < 0) return 0;
  if (k >= n) return 1;
  let term = (1 - p) ** n;
  let cdf = term;
  for (let i = 1; i <= k; i++) {
    term *= ((n - i + 1) / i) * (p / (1 - p));
    cdf += term;
  }
  return cdf;
}

// Exact (Clopper-Pearson) two-sided CI for a binomial proportion, by bisection.
function clopperPearson(failures, n, confidence = 0.95) {
  const alpha = 1 - confidence;
  const solve = (f) => {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      if (f(mid) > 0) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  };
  const lower = failures === 0 ? 0 : solve((p) => 1 - binomialCdf(failures - 1, n, p) < alpha / 2 ? 1 : -1);
  const upper = failures === n ? 1 : solve((p) => binomialCdf(failures, n, p) > alpha / 2 ? 1 : -1);
  return { lower, upper };
}

function round(value, decimals) {
  if (value === null) return null;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function listBatches() {
  if (!fs.existsSync(RESULTS_DIR)) return [];
  return fs.readdirSync(RESULTS_DIR).filter((d) => d.startsWith('batch-'));
}

function loadBatch(batchName) {
  const dir = path.join(RESULTS_DIR, batchName);
  const files = fs.readdirSync(dir).filter((f) => /^run-\d+\.json$/.test(f));
  return files
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')))
    .sort((a, b) => a.runIndex - b.runIndex);
}

function summarizeBatch(batchName, runs) {
  const succeeded = runs.filter((r) => r.endToEndLatencyMs !== null);
  const failed = runs.length - succeeded.length;
  const latencies = succeeded.map((r) => r.endToEndLatencyMs);

  if (latencies.length === 0) {
    return { batch: batchName, n_runs: runs.length, n_failed: failed, error: 'no successful runs' };
  }

  const medianMs = median(latencies);
  const failureCi = clopperPearson(failed, runs.length);
  return {
    batch: batchName,
    n_runs: runs.length,
    n_failed: failed,
    median_ms: medianMs,
    min_ms: Math.min(...latencies),
    max_ms: Math.max(...latencies),
    p95_ms: percentile(latencies, 95),
    mean_ms: round(mean(latencies), 1),
    stddev_ms: round(sampleStdDev(latencies), 1),
    failure_rate_ci95_low: round(failureCi.lower, 4),
    failure_rate_ci95_high: round(failureCi.upper, 4),
    criterion_ms: CRITERION_MS,
    meets_criterion: medianMs <= CRITERION_MS,
  };
}

function toCsv(summaries) {
  const cols = [
    'batch', 'n_runs', 'n_failed', 'median_ms', 'min_ms', 'max_ms', 'p95_ms', 'mean_ms', 'stddev_ms',
    'failure_rate_ci95_low', 'failure_rate_ci95_high', 'criterion_ms', 'meets_criterion',
  ];
  const lines = [cols.join(',')];
  for (const s of summaries) {
    if (s.error) continue;
    lines.push(cols.map((c) => s[c]).join(','));
  }
  return lines.join('\n') + '\n';
}

function main() {
  const batches = listBatches();
  if (batches.length === 0) {
    console.log('No batches found under results/. Run run-batch.mjs first.');
    return;
  }

  const summaries = batches.map((b) => summarizeBatch(b, loadBatch(b)));

  fs.writeFileSync(path.join(RESULTS_DIR, 'summary.json'), JSON.stringify(summaries, null, 2));
  fs.writeFileSync(path.join(RESULTS_DIR, 'summary.csv'), toCsv(summaries));

  console.log(`Wrote summary.json and summary.csv (${batches.length} batch(es)).\n`);
  for (const s of summaries) {
    if (s.error) {
      console.log(`${s.batch}: ${s.error} (${s.n_failed}/${s.n_runs} failed)`);
      continue;
    }
    const verdict = s.meets_criterion ? 'MEETS' : 'EXCEEDS';
    console.log(
      `${s.batch}: median=${s.median_ms}ms  min=${s.min_ms}ms  max=${s.max_ms}ms  p95=${s.p95_ms}ms  ` +
      `mean=${s.mean_ms}ms  sd=${s.stddev_ms}ms  ` +
      `failure-rate 95% CI=[${(s.failure_rate_ci95_low * 100).toFixed(1)}%, ${(s.failure_rate_ci95_high * 100).toFixed(1)}%]  ` +
      `[${verdict} the ≤${CRITERION_MS}ms (§3.2) criterion]  (${s.n_failed} failed of ${s.n_runs})`,
    );
  }
}

main();
