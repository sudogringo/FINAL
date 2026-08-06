import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = path.join(__dirname, 'results');

const CSV_COLUMNS = [
  'label', 'device', 'run',
  'performance', 'accessibility', 'best_practices', 'seo',
  'lcp_ms', 'cls', 'tbt_ms', 'fcp_ms', 'speed_index_ms',
];

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function parseFileName(fileName) {
  const base = fileName.replace(/\.json$/, '');
  const match = base.match(/^(.+)-(mobile|desktop)(?:-(\d+))?$/);
  if (!match) return null;
  const [, label, device, run] = match;
  return { label, device, run: run ? Number(run) : 1 };
}

function extractRow(lhr, meta) {
  const audits = lhr.audits;
  return {
    label: meta.label,
    device: meta.device,
    run: meta.run,
    performance: Math.round(lhr.categories.performance.score * 100),
    accessibility: Math.round(lhr.categories.accessibility.score * 100),
    best_practices: Math.round(lhr.categories['best-practices'].score * 100),
    seo: Math.round(lhr.categories.seo.score * 100),
    lcp_ms: audits['largest-contentful-paint']?.numericValue ?? null,
    cls: audits['cumulative-layout-shift']?.numericValue ?? null,
    tbt_ms: audits['total-blocking-time']?.numericValue ?? null,
    fcp_ms: audits['first-contentful-paint']?.numericValue ?? null,
    speed_index_ms: audits['speed-index']?.numericValue ?? null,
  };
}

function toCsv(rows) {
  const lines = [CSV_COLUMNS.join(',')];
  for (const row of rows) {
    lines.push(CSV_COLUMNS.map((col) => row[col] ?? '').join(','));
  }
  return lines.join('\n') + '\n';
}

const MEDIAN_COLUMNS = [
  'label', 'device', 'n_runs',
  'performance', 'accessibility', 'best_practices', 'seo',
  'lcp_ms', 'cls', 'tbt_ms', 'fcp_ms', 'speed_index_ms',
];

function toMedianCsv(nested) {
  const lines = [MEDIAN_COLUMNS.join(',')];
  for (const label of Object.keys(nested)) {
    for (const device of Object.keys(nested[label])) {
      const entry = nested[label][device];
      const row = {
        label,
        device,
        n_runs: entry.runs.length,
        ...entry.medians,
      };
      lines.push(MEDIAN_COLUMNS.map((col) => row[col] ?? '').join(','));
    }
  }
  return lines.join('\n') + '\n';
}

function buildNestedSummary(rows) {
  const nested = {};
  for (const row of rows) {
    nested[row.label] ??= {};
    nested[row.label][row.device] ??= { runs: [], medians: {} };
    nested[row.label][row.device].runs.push(row);
  }
  const metrics = ['performance', 'accessibility', 'best_practices', 'seo', 'lcp_ms', 'cls', 'tbt_ms', 'fcp_ms', 'speed_index_ms'];
  for (const label of Object.keys(nested)) {
    for (const device of Object.keys(nested[label])) {
      const entry = nested[label][device];
      for (const metric of metrics) {
        const values = entry.runs.map((r) => r[metric]).filter((v) => v !== null);
        entry.medians[metric] = values.length ? median(values) : null;
      }
    }
  }
  return nested;
}

function printComparisonTable(nested) {
  const labels = Object.keys(nested);
  if (!labels.length) {
    console.log('No results found.');
    return;
  }
  for (const device of ['mobile', 'desktop']) {
    console.log(`\n=== ${device} ===`);
    console.log('label'.padEnd(12), 'perf', 'a11y', 'bp', 'seo', 'lcp_ms', 'cls', 'tbt_ms');
    for (const label of labels) {
      const m = nested[label][device]?.medians;
      if (!m) continue;
      console.log(
        label.padEnd(12),
        String(m.performance).padEnd(4),
        String(m.accessibility).padEnd(4),
        String(m.best_practices).padEnd(2),
        String(m.seo).padEnd(3),
        String(Math.round(m.lcp_ms ?? 0)).padEnd(6),
        String((m.cls ?? 0).toFixed(3)).padEnd(5),
        String(Math.round(m.tbt_ms ?? 0)),
      );
    }
  }
}

function main() {
  if (!fs.existsSync(RESULTS_DIR)) {
    console.log('No results directory found. Run run-audit.mjs first.');
    return;
  }

  const files = fs.readdirSync(RESULTS_DIR).filter((f) => f.endsWith('.json') && !f.startsWith('summary'));
  const rows = [];

  for (const file of files) {
    const meta = parseFileName(file);
    if (!meta) {
      console.warn(`Skipping unrecognized file name: ${file}`);
      continue;
    }
    const lhr = JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, file), 'utf-8'));
    rows.push(extractRow(lhr, meta));
  }

  rows.sort((a, b) => a.label.localeCompare(b.label) || a.device.localeCompare(b.device) || a.run - b.run);

  const nested = buildNestedSummary(rows);

  fs.writeFileSync(path.join(RESULTS_DIR, 'summary.json'), JSON.stringify(nested, null, 2));
  fs.writeFileSync(path.join(RESULTS_DIR, 'summary.csv'), toCsv(rows));
  fs.writeFileSync(path.join(RESULTS_DIR, 'summary-medians.csv'), toMedianCsv(nested));

  console.log(`Wrote summary.json, summary.csv, and summary-medians.csv (${rows.length} runs across ${files.length} files).`);
  printComparisonTable(nested);
}

main();
