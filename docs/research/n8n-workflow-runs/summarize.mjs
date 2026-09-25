import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Reads results/runs.csv + results/<wf>-<n>.log and writes results/summary.csv.
// A run is OK only if the CLI exited 0 and n8n did not report "Execution was NOT successful".

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'results');
const [, ...lines] = fs.readFileSync(path.join(dir, 'runs.csv'), 'utf-8').trim().split('\n');

function errorInfo(log) {
  const start = log.indexOf('{');
  if (start === -1) return { node: '', message: log.trim().split('\n').pop() ?? '' };
  // --rawOutput prints the execution JSON followed by plain-text error lines.
  let depth = 0, end = start;
  for (let i = start; i < log.length; i++) {
    if (log[i] === '{') depth++;
    else if (log[i] === '}' && --depth === 0) { end = i + 1; break; }
  }
  try {
    const err = JSON.parse(log.slice(start, end)).data?.resultData?.error;
    return { node: err?.node?.name ?? '', message: err?.message ?? '' };
  } catch {
    return { node: '', message: 'unparseable log' };
  }
}

const csv = (s) => `"${String(s).replaceAll('"', '""')}"`;
const out = ['workflow,run,ok,duration_ms,failing_node,error'];
const perWf = {};
for (const line of lines) {
  const [wf, run, code, ms] = line.split(',');
  const log = fs.readFileSync(path.join(dir, `${wf}-${run}.log`), 'utf-8');
  const ok = code === '0' && !log.includes('Execution was NOT successful');
  const { node, message } = ok ? { node: '', message: '' } : errorInfo(log);
  out.push([wf, run, ok, ms, csv(node), csv(message)].join(','));
  perWf[wf] ??= { ok: 0, fail: 0 };
  perWf[wf][ok ? 'ok' : 'fail']++;
}
fs.writeFileSync(path.join(dir, 'summary.csv'), out.join('\n') + '\n');
console.table(perWf);
