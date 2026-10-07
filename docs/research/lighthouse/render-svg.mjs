import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';

// Renders an SVG to PNG at a fixed scale with the Chromium that ships with
// Puppeteer, so the thesis figures come from the same SVG as docs/assets/.
// Usage: node render-svg.mjs <in.svg> <out.png> [scale]
const [input, output, scale = '2'] = process.argv.slice(2);
const svg = fs.readFileSync(input, 'utf-8');
const [, w, h] = svg.match(/width="(\d+)" height="(\d+)"/);
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: Number(scale) });
await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
await page.screenshot({ path: output, clip: { x: 0, y: 0, width: Number(w), height: Number(h) } });
await browser.close();
console.log('wrote', path.resolve(output));
