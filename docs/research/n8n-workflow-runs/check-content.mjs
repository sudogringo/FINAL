// Content check for a batch of `n8n execute --rawOutput` logs.
//
// "No execution error" is not enough: on 25/09/2026 workflow 02 finished without
// error while reporting three Lighthouse categories as 0/100. For every log this
// script records which trigger actually started the run (n8n execute starts the
// first trigger on the canvas, which may be a schedule rather than the Manual
// Trigger), the item count of every executed node, and a per-workflow content
// criterion. Output: <batch>/content.csv and a console table.
//
// Usage: node check-content.mjs results/<batch>

import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2];
if (!dir) throw new Error('Usage: node check-content.mjs results/<batch>');

function parseLog(file) {
  const raw = fs.readFileSync(file, 'utf8');
  // The execution JSON starts on a line that is just "{" (LF or CRLF endings).
  const start = raw.search(/^\{\r?$/m);
  if (start < 0) return null;
  try { return JSON.parse(raw.slice(start, raw.lastIndexOf('}') + 1)); } catch { return null; }
}

const items = (run) => (run?.data?.main ?? []).flatMap((out) => out ?? []).map((i) => i.json ?? {});
const isTrigger = (name) => /trigger|schedule|cron|every \d|webhook|form/i.test(name);

// Node name -> node type, from the exported workflows, to recognise delivery nodes
// (Gmail, Google Sheets) whatever they are called on the canvas.
const WORKFLOWS_DIR = new URL('../../../n8n/workflows/', import.meta.url);
const nodeType = new Map();
for (const f of fs.readdirSync(WORKFLOWS_DIR).filter((f) => f.endsWith('.json'))) {
  const wf = JSON.parse(fs.readFileSync(new URL(f, WORKFLOWS_DIR), 'utf8'));
  for (const n of wf.nodes) nodeType.set(n.name, n.type);
}
const isDelivery = (name) => /gmail|googleSheets/i.test(nodeType.get(name) ?? name);

// Per-workflow criterion: what a run must have produced, beyond finishing.
const CRITERIA = {
  '01': (n) => /#[0-9a-f]{6}/i.test(JSON.stringify(n)) || 'no hex colour extracted',
  '02': (n) => {
    // PageSpeed must have returned all four categories; before 08/10/2026 the
    // report turned a missing category into 0, so a number alone proves nothing.
    for (const node of ['PSI Mobile', 'PSI Desktop']) {
      const cats = n[node]?.[0]?.lighthouseResult?.categories ?? {};
      const missing = ['performance', 'accessibility', 'best-practices', 'seo'].filter((c) => !cats[c]);
      if (missing.length) return `${node} did not return: ${missing.join(' ')}`;
    }
    const r = Object.entries(n).find(([k]) => /Reporte SEO/.test(k))?.[1]?.[0];
    if (!r) return 'no report node output';
    const scores = ['mobileScore', 'desktopScore', 'mobileAccess', 'desktopAccess', 'mobileBP', 'desktopBP', 'mobileSEO', 'desktopSEO'];
    const missing = scores.filter((k) => typeof r[k] !== 'number');
    return missing.length === 0 || `missing scores: ${missing.join(' ')}`;
  },
  '03': (n) => Object.entries(n).some(([k, v]) => /Mock Reviews/.test(k) && v.length > 0) || 'no reviews',
  '04': (n) => Object.entries(n).some(([k, v]) => /Formatear/.test(k) && v.length > 0) || 'no formatted posts',
  '05': (n) => Object.entries(n).some(([k, v]) => /GET|Obtener|stats|orders/i.test(k) && v.length > 0) || 'backend returned nothing',
  '06a': (n) => Object.entries(n).some(([k, v]) => /subscribers|GET/i.test(k) && v.length > 0) || 'no subscribers',
  '06b': (n) => Object.entries(n).some(([k, v]) => /GET|posts|carrito/i.test(k) && v.length > 0) || 'no carts',
  '07': (n) => {
    const html = JSON.stringify(n);
    if (!/Resumen de despacho/.test(html)) return 'no dispatch summary';
    if (/>null</.test(html)) return 'null in summary';
    const orders = Object.entries(n).find(([k]) => /Obtener/.test(k))?.[1] ?? [];
    return orders.length > 0 || 'no confirmed orders';
  },
};

const rows = [['workflow', 'run', 'status', 'trigger', 'nodes', 'delivered', 'content_ok', 'content_note']];
for (const file of fs.readdirSync(dir).filter((f) => /^\w+-\d+\.log$/.test(f)).sort()) {
  const [wf, run] = file.replace('.log', '').split('-');
  const log = parseLog(path.join(dir, file));
  const runData = log?.data?.resultData?.runData;
  if (!runData) { rows.push([wf, run, 'no-json', '', 0, false, false, 'log has no execution JSON']); continue; }
  const ordered = Object.entries(runData).sort((a, b) => a[1][0].startTime - b[1][0].startTime);
  const trigger = ordered.find(([name]) => isTrigger(name))?.[0] ?? ordered[0][0];
  const nodes = Object.fromEntries(ordered.map(([name, runs]) => [name, items(runs[0])]));
  const errors = ordered.filter(([, runs]) => runs[0].error).map(([name]) => name);
  // Delivered: a Gmail or Sheets node ran and returned at least one item (Gmail
  // returns the sent message id; Sheets the written rows).
  const delivered = ordered.some(([name, runs]) => isDelivery(name) && !runs[0].error && items(runs[0]).length > 0);
  const verdict = errors.length ? `errors in: ${errors.join(', ')}` : (CRITERIA[wf] ? CRITERIA[wf](nodes) : true);
  rows.push([wf, run, log.status ?? '', trigger, ordered.length, delivered, verdict === true, verdict === true ? '' : verdict]);
}

const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
fs.writeFileSync(path.join(dir, 'content.csv'), csv + '\n');
for (const r of rows) console.log(r.join(' | '));
