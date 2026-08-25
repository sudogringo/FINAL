// Reads every results/batch-*/run-*.json, computes median/min/max/p95 of
// endToEndLatencyMs, and contrasts against the ≤15s design criterion (§3.2).
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
  return {
    batch: batchName,
    n_runs: runs.length,
    n_failed: failed,
    median_ms: medianMs,
    min_ms: Math.min(...latencies),
    max_ms: Math.max(...latencies),
    p95_ms: percentile(latencies, 95),
    criterion_ms: CRITERION_MS,
    meets_criterion: medianMs <= CRITERION_MS,
  };
}

function toCsv(summaries) {
  const cols = ['batch', 'n_runs', 'n_failed', 'median_ms', 'min_ms', 'max_ms', 'p95_ms', 'criterion_ms', 'meets_criterion'];
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
      `[${verdict} the ≤${CRITERION_MS}ms (§3.2) criterion]  (${s.n_failed} failed of ${s.n_runs})`,
    );
  }
}

main();
