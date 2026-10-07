import fs from 'node:fs';
import puppeteer from 'puppeteer';

// Renders a Mermaid file to PNG with Puppeteer's Chromium and Mermaid from
// the jsDelivr CDN (no install, no paid service). Prints the diagram's CSS
// width so the printed font size can be checked against the page width.
// Usage: node render-mermaid.mjs <in.mmd> <out.png> [scale]
const [input, output, scale = '2'] = process.argv.slice(2);
const src = fs.readFileSync(input, 'utf-8');
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 2400, height: 3000, deviceScaleFactor: Number(scale) });
await page.setContent(`<html><body style="margin:0;background:#fff"><pre class="mermaid">${src.replace(/</g, '&lt;')}</pre>
<script type="module">import m from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs'; m.initialize({startOnLoad:false}); await m.run(); document.body.dataset.done='1';</script></body></html>`);
await page.waitForSelector('body[data-done="1"]', { timeout: 60000 });
const svg = await page.$('pre.mermaid svg');
const box = await svg.boundingBox();
await svg.screenshot({ path: output });
console.log('css width', Math.round(box.width), 'height', Math.round(box.height));
await browser.close();
