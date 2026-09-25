import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Renders plain SVG charts from results/summary.csv — no charting library,
// no headless browser, no paid service. Just string templates, so it stays
// in line with the zero-budget constraint and the "standalone script" pattern
// already used by run-audit.mjs / summarize.mjs.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = path.join(__dirname, 'results');
const ASSETS_DIR = path.join(__dirname, '..', '..', 'assets');

const COLORS = {
  // Okabe-Ito blue/orange: distinguishable under the common colour-vision
  // deficiencies; the original series is also hatched (see HATCH_ORIGINAL).
  new: '#0072B2',
  'new-hosted': '#0072B2',
  original: '#E69F00',
  grid: '#d9d9d9',
  text: '#222222',
  bar: '#3b6fd1',
};

const METRIC_LABELS_ES = {
  performance: 'Performance',
  accessibility: 'Accesibilidad',
  best_practices: 'Buenas prácticas',
  seo: 'SEO',
};

const DEVICE_LABELS_ES = {
  desktop: 'escritorio',
  mobile: 'móvil',
};

function readCsv(file) {
  const text = fs.readFileSync(file, 'utf-8').trim();
  const [header, ...lines] = text.split('\n');
  const cols = header.split(',');
  return lines.map((line) => {
    const values = line.split(',');
    const row = {};
    cols.forEach((c, i) => { row[c] = values[i]; });
    return row;
  });
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function svgWrap(width, height, body, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="Arial, Helvetica, sans-serif">
<rect width="${width}" height="${height}" fill="#ffffff"/>
<text x="${width / 2}" y="28" text-anchor="middle" font-size="18" font-weight="bold" fill="${COLORS.text}">${title}</text>
${body}
</svg>`;
}

const HATCH_ORIGINAL = `<defs><pattern id="hatch-original" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="${COLORS.original}"/><line x1="0" y1="0" x2="0" y2="6" stroke="#5a3d00" stroke-width="2"/></pattern></defs>`;
const fillFor = (label) => (label === 'original' ? 'url(#hatch-original)' : COLORS[label]);

// --- Chart 1: median comparison bars, original vs new, per device ---
function chartMedianComparison(rows) {
  const metrics = ['performance', 'accessibility', 'best_practices', 'seo'];
  const devices = ['desktop', 'mobile'];
  const width = 962, height = 420;
  const marginLeft = 60, marginBottom = 60, marginTop = 80;
  const plotW = width - marginLeft - 40;
  const plotH = height - marginTop - marginBottom;
  const groupW = plotW / (devices.length * metrics.length);

  let body = HATCH_ORIGINAL;
  // axis
  body += `<line x1="${marginLeft}" y1="${marginTop}" x2="${marginLeft}" y2="${marginTop + plotH}" stroke="${COLORS.grid}"/>`;
  body += `<line x1="${marginLeft}" y1="${marginTop + plotH}" x2="${width - 40}" y2="${marginTop + plotH}" stroke="${COLORS.grid}"/>`;
  for (let g = 0; g <= 100; g += 20) {
    const y = marginTop + plotH - (g / 100) * plotH;
    body += `<line x1="${marginLeft}" y1="${y}" x2="${width - 40}" y2="${y}" stroke="${COLORS.grid}" stroke-dasharray="4,4"/>`;
    body += `<text x="${marginLeft - 10}" y="${y + 4}" text-anchor="end" font-size="11" fill="${COLORS.text}">${g}</text>`;
  }
  const yAxisCenter = marginTop + plotH / 2;
  body += `<text x="18" y="${yAxisCenter}" text-anchor="middle" font-size="11" fill="${COLORS.text}" transform="rotate(-90 18 ${yAxisCenter})">Puntaje (0–100)</text>`;

  let gi = 0;
  for (const device of devices) {
    for (const metric of metrics) {
      const groupX = marginLeft + gi * groupW;
      const labels = ['original', 'new-hosted'];
      labels.forEach((label, li) => {
        const matching = rows.filter((r) => r.label === label && r.device === device);
        const values = matching.map((r) => Number(r[metric]));
        const med = values.length ? median(values) : 0;
        const barW = groupW / (labels.length + 0.5);
        const x = groupX + li * barW + 4;
        const barH = (med / 100) * plotH;
        const y = marginTop + plotH - barH;
        body += `<rect x="${x}" y="${y}" width="${barW - 4}" height="${barH}" fill="${fillFor(label)}"/>`;
        body += `<text x="${x + (barW - 4) / 2}" y="${y - 4}" text-anchor="middle" font-size="10" fill="${COLORS.text}">${Math.round(med)}</text>`;
      });
      const labelX = groupX + groupW / 2;
      body += `<text x="${labelX}" y="${marginTop + plotH + 16}" text-anchor="middle" font-size="10" fill="${COLORS.text}" transform="rotate(0)">${METRIC_LABELS_ES[metric]}</text>`;
      body += `<text x="${labelX}" y="${marginTop + plotH + 30}" text-anchor="middle" font-size="9" fill="#888">${DEVICE_LABELS_ES[device]}</text>`;
      gi++;
    }
  }

  // legend
  body += `<rect x="${marginLeft}" y="${marginTop - 36}" width="12" height="12" fill="${fillFor('original')}"/>`;
  body += `<text x="${marginLeft + 18}" y="${marginTop - 26}" font-size="11" fill="${COLORS.text}">sitio original (n=1)</text>`;
  body += `<rect x="${marginLeft + 200}" y="${marginTop - 36}" width="12" height="12" fill="${COLORS['new-hosted']}"/>`;
  body += `<text x="${marginLeft + 218}" y="${marginTop - 26}" font-size="11" fill="${COLORS.text}">catálogo nuevo, alojado en GitHub Pages (mediana, n=5)</text>`;

  return svgWrap(width, height, body, 'Puntajes medianos de Lighthouse — sitio original vs. catálogo nuevo');
}

// --- Chart 2: per-run performance spread for "new-hosted", both devices ---
function chartRunSpread(rows) {
  const width = 900, height = 420;
  const marginLeft = 50, marginBottom = 50, marginTop = 60, marginRight = 40;
  const plotW = width - marginLeft - marginRight;
  const plotH = height - marginTop - marginBottom;

  const newRows = rows.filter((r) => r.label === 'new-hosted');
  const devices = ['desktop', 'mobile'];
  const maxRun = 5;

  let allVals = newRows.map((r) => Number(r.performance));
  const yMin = Math.max(0, Math.min(...allVals) - 10);
  const yMax = Math.min(100, Math.max(...allVals) + 10);

  function yFor(v) {
    return marginTop + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  }
  function xFor(run) {
    return marginLeft + ((run - 1) / (maxRun - 1)) * plotW;
  }

  let body = '';
  body += `<line x1="${marginLeft}" y1="${marginTop}" x2="${marginLeft}" y2="${marginTop + plotH}" stroke="${COLORS.grid}"/>`;
  body += `<line x1="${marginLeft}" y1="${marginTop + plotH}" x2="${width - marginRight}" y2="${marginTop + plotH}" stroke="${COLORS.grid}"/>`;

  for (let g = Math.ceil(yMin / 10) * 10; g <= yMax; g += 10) {
    const y = yFor(g);
    body += `<line x1="${marginLeft}" y1="${y}" x2="${width - marginRight}" y2="${y}" stroke="${COLORS.grid}" stroke-dasharray="4,4"/>`;
    body += `<text x="${marginLeft - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="${COLORS.text}">${g}</text>`;
  }
  for (let run = 1; run <= maxRun; run++) {
    body += `<text x="${xFor(run)}" y="${marginTop + plotH + 20}" text-anchor="middle" font-size="11" fill="${COLORS.text}">corrida ${run}</text>`;
  }

  const deviceColor = { desktop: '#3b6fd1', mobile: '#d1893b' };
  for (const device of devices) {
    const devRows = newRows.filter((r) => r.device === device).sort((a, b) => Number(a.run) - Number(b.run));
    const points = devRows.map((r) => `${xFor(Number(r.run))},${yFor(Number(r.performance))}`).join(' ');
    body += `<polyline points="${points}" fill="none" stroke="${deviceColor[device]}" stroke-width="2"/>`;
    devRows.forEach((r) => {
      body += `<circle cx="${xFor(Number(r.run))}" cy="${yFor(Number(r.performance))}" r="4" fill="${deviceColor[device]}"/>`;
    });
    const med = median(devRows.map((r) => Number(r.performance)));
    const medY = yFor(med);
    body += `<line x1="${marginLeft}" y1="${medY}" x2="${width - marginRight}" y2="${medY}" stroke="${deviceColor[device]}" stroke-dasharray="6,3" opacity="0.5"/>`;
    body += `<text x="${width - marginRight + 2}" y="${medY + 4}" font-size="10" fill="${deviceColor[device]}">mediana ${Math.round(med)}</text>`;
  }

  body += `<circle cx="${width - 200}" cy="${marginTop - 15}" r="4" fill="${deviceColor.desktop}"/>`;
  body += `<text x="${width - 190}" y="${marginTop - 11}" font-size="11" fill="${COLORS.text}">escritorio</text>`;
  body += `<circle cx="${width - 120}" cy="${marginTop - 15}" r="4" fill="${deviceColor.mobile}"/>`;
  body += `<text x="${width - 110}" y="${marginTop - 11}" font-size="11" fill="${COLORS.text}">móvil</text>`;

  return svgWrap(width, height, body, 'Puntaje de Performance en 5 corridas — catálogo nuevo, GitHub Pages (línea punteada = mediana)');
}

function main() {
  const rows = readCsv(path.join(RESULTS_DIR, 'summary.csv'));
  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  const chart1 = chartMedianComparison(rows);
  const chart2 = chartRunSpread(rows);

  fs.writeFileSync(path.join(ASSETS_DIR, 'lighthouse-median-comparison.svg'), chart1);
  fs.writeFileSync(path.join(ASSETS_DIR, 'lighthouse-new-runs-spread.svg'), chart2);

  console.log(`Wrote docs/assets/lighthouse-median-comparison.svg`);
  console.log(`Wrote docs/assets/lighthouse-new-runs-spread.svg`);
}

main();
