import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as chromeLauncher from 'chrome-launcher';
import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = path.join(__dirname, 'results');

const DEVICE_CONFIG = {
  mobile: { formFactor: 'mobile', screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false } },
  desktop: { formFactor: 'desktop', screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false } },
};

function parseArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    const [key, value] = arg.replace(/^--/, '').split('=');
    args[key] = value ?? true;
  }
  if (!args.url) throw new Error('Missing --url=<url>');
  if (!args.label) throw new Error('Missing --label=<name>');
  args.runs = Number(args.runs ?? 1);
  args.device = args.device ?? 'both';
  if (!['mobile', 'desktop', 'both'].includes(args.device)) {
    throw new Error(`Invalid --device value: ${args.device}`);
  }
  return args;
}

function isLocalUrl(url) {
  try {
    const { hostname } = new URL(url);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

async function runOnce({ url, device, chromePort }) {
  const result = await lighthouse(url, {
    port: chromePort,
    output: ['json', 'html'],
    logLevel: 'info',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  }, {
    extends: 'lighthouse:default',
    settings: {
      formFactor: DEVICE_CONFIG[device].formFactor,
      screenEmulation: DEVICE_CONFIG[device].screenEmulation,
    },
  });
  return result;
}

async function main() {
  const { url, label, runs, device } = parseArgs();

  if (runs > 1 && !isLocalUrl(url)) {
    throw new Error(
      `Refusing to run ${runs} audits against non-local URL "${url}". ` +
      `Only a single run is allowed against external sites to avoid hammering them. Pass --runs=1.`
    );
  }

  fs.mkdirSync(RESULTS_DIR, { recursive: true });

  const devices = device === 'both' ? ['mobile', 'desktop'] : [device];

  const chromePath = puppeteer.executablePath();

  for (const dev of devices) {
    for (let run = 1; run <= runs; run++) {
      const chrome = await chromeLauncher.launch({
        chromePath,
        chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
      });

      console.log(`\n[${label}] ${dev} — run ${run}/${runs} — auditing ${url}`);
      try {
        const { report, lhr } = await runOnce({ url, device: dev, chromePort: chrome.port });
        const suffix = runs > 1 ? `-${run}` : '';
        const baseName = `${label}-${dev}${suffix}`;

        fs.writeFileSync(path.join(RESULTS_DIR, `${baseName}.json`), report[0]);
        fs.writeFileSync(path.join(RESULTS_DIR, `${baseName}.html`), report[1]);

        console.log(
          `  performance=${Math.round(lhr.categories.performance.score * 100)} ` +
          `accessibility=${Math.round(lhr.categories.accessibility.score * 100)} ` +
          `best-practices=${Math.round(lhr.categories['best-practices'].score * 100)} ` +
          `seo=${Math.round(lhr.categories.seo.score * 100)}`
        );
      } finally {
        await chrome.kill();
      }
    }
  }

  console.log(`\nDone. Results written to ${RESULTS_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
