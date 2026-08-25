// Fires N synthetic quote requests against the local backend in measurement mode
// (MEASURE_LATENCY=true — see backend/src/routes/quotes.ts) and records the
// full round trip: T0 (clientSubmittedAt, simulated here in place of the real
// frontend click) -> backend receivedAt -> n8n t1_start/t1_end -> response back
// to this script. Each run's raw result is written to results/<batch>/run-N.json.
//
// Usage: node run-batch.mjs [--runs=18] [--base-url=http://localhost:3001] [--label=<batch-name>]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildQuotePayload } from './fixtures.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = path.join(__dirname, 'results');

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, '').split('=');
      return [k, v ?? true];
    }),
  );
  return {
    runs: Number(args.runs ?? 18),
    baseUrl: args['base-url'] ?? 'http://localhost:3001',
    label: args.label ?? new Date().toISOString().slice(0, 10),
  };
}

function requireArchived(batchDir) {
  if (fs.existsSync(batchDir) && fs.readdirSync(batchDir).length > 0) {
    throw new Error(
      `results/${path.basename(batchDir)} already has data. Archive it first ` +
      `(see README "Re-running" playbook) before generating a new batch with the same label.`,
    );
  }
}

async function fireOne(baseUrl, runIndex) {
  const payload = buildQuotePayload(runIndex);
  const clientSubmittedAt = payload.clientSubmittedAt = new Date().toISOString();

  const startedAt = Date.now();
  let httpStatus = null;
  let body = null;
  let error = null;

  try {
    const res = await fetch(`${baseUrl}/api/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    httpStatus = res.status;
    body = await res.json().catch(() => null);
  } catch (err) {
    error = String(err);
  }

  const respondedAt = Date.now();

  return {
    runIndex,
    clientSubmittedAt,
    httpStatus,
    error,
    // Full round trip as observed by this script (network + backend + n8n).
    scriptObservedLatencyMs: respondedAt - startedAt,
    // What the backend/n8n actually reported for their own timestamps, when present.
    backendReceivedAt: body?.receivedAt ?? null,
    n8n: body?.n8n ?? null,
    // The number that matters for VD2 (§3.2): from the (simulated) click to n8n
    // finishing its notification — end-to-end, not just the backend's own work.
    endToEndLatencyMs: body?.n8n?.t1_end
      ? new Date(body.n8n.t1_end).getTime() - new Date(clientSubmittedAt).getTime()
      : null,
  };
}

async function main() {
  const { runs, baseUrl, label } = parseArgs();
  const batchDir = path.join(RESULTS_DIR, `batch-${label}`);
  requireArchived(batchDir);
  fs.mkdirSync(batchDir, { recursive: true });

  console.log(`Firing ${runs} quote requests against ${baseUrl} (MEASURE_LATENCY must be 'true' on the backend)...`);

  const results = [];
  for (let i = 1; i <= runs; i++) {
    const result = await fireOne(baseUrl, i);
    results.push(result);
    fs.writeFileSync(path.join(batchDir, `run-${i}.json`), JSON.stringify(result, null, 2));
    const ok = result.endToEndLatencyMs !== null;
    console.log(
      `  run ${i}/${runs}: ${ok ? `${result.endToEndLatencyMs}ms` : `FAILED (status=${result.httpStatus}, error=${result.error})`}`,
    );
  }

  const failures = results.filter((r) => r.endToEndLatencyMs === null).length;
  console.log(`\nDone. ${results.length - failures}/${results.length} runs succeeded. Batch: results/batch-${label}/`);
  if (failures > 0) {
    console.warn(
      `${failures} run(s) failed — check that MEASURE_LATENCY=true is set on the backend, ` +
      `N8N_QUOTE_WEBHOOK points at the local n8n instance, and workflow "00. Lead Notification" is active.`,
    );
  }
  console.log('Next: node summarize.mjs');
}

main();
