// Tests of the per-workflow content oracles in check-content.mjs.
// Run: node --test docs/research/n8n-workflow-runs/check-content.test.mjs
// (a) every oracle must pass on the real executions of 08/10/2026;
// (b) every oracle must fail on a minimally corrupted copy, and name the broken check.

import test from 'node:test';
import assert from 'node:assert/strict';
import { ORACLES, loadNodes } from './check-content.mjs';

const BATCH = new URL('./results/2026-10-08/', import.meta.url);
const BATCH_04 = new URL('./results/2026-10-08-wf04/', import.meta.url);
const real = (wf, n = 1) => loadNodes(new URL(`${wf}-${n}.log`, wf === '04' ? BATCH_04 : BATCH));
const clone = (x) => structuredClone(x);
const failed = (r) => r.checks.filter((c) => !c.pass).map((c) => c.name);

function expectPass(wf, n) {
  const r = ORACLES[wf](real(wf, n));
  assert.deepEqual(failed(r), [], `${wf}-${n}: ${JSON.stringify(r.checks.filter((c) => !c.pass))}`);
  assert.equal(r.pass, true);
  assert.ok(r.checks.length >= 4, 'an oracle with fewer than 4 checks is not an oracle');
}
function expectFail(wf, mutate, checkName) {
  const nodes = clone(real(wf));
  mutate(nodes);
  const r = ORACLES[wf](nodes);
  assert.equal(r.pass, false, `${wf}: corrupted copy must fail`);
  assert.ok(failed(r).includes(checkName), `${wf}: expected "${checkName}" to fail, got ${failed(r)}`);
}
const node = (nodes, re) => Object.entries(nodes).find(([k]) => re.test(k))[1];

for (const wf of ['01', '02', '03', '04', '05', '06a', '06b', '07']) {
  test(`${wf}: passes on the real executions (3 runs)`, () => {
    for (const n of [1, 2, 3]) expectPass(wf, n);
  });
}

test('oracle result shape is {pass, checks:[{name, pass, detail}]}', () => {
  const r = ORACLES['03'](real('03'));
  assert.equal(typeof r.pass, 'boolean');
  for (const c of r.checks) {
    assert.equal(typeof c.name, 'string');
    assert.equal(typeof c.pass, 'boolean');
    assert.equal(typeof c.detail, 'string');
  }
});

// ---- 01 ----
test('01: a palette colour that is not in the analysed HTML fails', () => {
  expectFail('01', (n) => { node(n, /Extract Colors/)[0].palette[2] = '#123456'; }, 'palette_in_source');
});
test('01: an invalid hex fails', () => {
  expectFail('01', (n) => { node(n, /Extract Colors/)[0].palette[0] = '#zzzzzz'; }, 'palette_valid_hex');
});
test('01: a palette that is not the most frequent colours fails', () => {
  expectFail('01', (n) => {
    const p = node(n, /Extract Colors/)[0].palette;
    [p[0], p[4]] = [p[4], p[0]];
  }, 'palette_is_top_by_frequency');
});
test('01: primary different from palette[0] fails', () => {
  expectFail('01', (n) => { node(n, /Extract Colors/)[0].primary = '#abcdef'; }, 'primary_secondary_consistent');
});
test('01: email without a palette colour fails', () => {
  expectFail('01', (n) => {
    const o = node(n, /Extract Colors/)[0];
    o.emailHtml = o.emailHtml.split(o.palette[0]).join('#000001');
  }, 'email_shows_palette_and_url');
});
test('01: empty HTML captured fails', () => {
  expectFail('01', (n) => { node(n, /Fetch HTML/)[0].body = ''; }, 'source_html_captured');
});

// ---- 03 ----
test('03: a misclassified review (5 stars escalated) fails', () => {
  expectFail('03', (n) => {
    const r = node(n, /Process All Reviews/)[0].all_reviews[0];
    r.action = 'notify_admin'; r.tesis_reply = null;
  }, 'classification_follows_rating');
});
test('03: a dropped review fails', () => {
  expectFail('03', (n) => { node(n, /Process All Reviews/)[0].all_reviews.pop(); }, 'one_result_per_review');
});
test('03: wrong negative count in the summary fails', () => {
  expectFail('03', (n) => { node(n, /Build Email/)[0].summary.negativas = 3; }, 'summary_counts_match_input');
});
test('03: a reviewer missing from the email body fails', () => {
  expectFail('03', (n) => {
    const o = node(n, /Build Email/)[0];
    o.html_body = o.html_body.split('Carlos Pérez').join('Alguien');
  }, 'email_lists_every_review');
});
test('03: a positive review whose reply does not name the reviewer fails', () => {
  expectFail('03', (n) => { node(n, /Process All Reviews/)[0].all_reviews[0].tesis_reply = 'Gracias.'; }, 'classification_follows_rating');
});
test('03: urgency flag inconsistent with the comment keywords fails', () => {
  expectFail('03', (n) => {
    const r = node(n, /Process All Reviews/)[0].all_reviews[3]; // "pésimo ... roto"
    r.action = 'notify_admin'; r.priority = 'normal';
  }, 'classification_follows_rating');
});

// ---- 04 ----
test('04: post that lost the sheet description fails', () => {
  expectFail('04', (n) => {
    const o = node(n, /Formatear Posts/)[0];
    o.post_instagram = o.post_instagram.replace('new product', 'otra cosa');
  }, 'posts_contain_sheet_fields');
});
test('04: wrong image URL fails', () => {
  expectFail('04', (n) => { node(n, /Formatear Posts/)[0].imagen_url_final = 'https://example.com/x.png'; }, 'image_url_rule');
});
test('04: hashtags not derived from product/description fail', () => {
  expectFail('04', (n) => { node(n, /Formatear Posts/)[0].hashtags = '#agro #campo'; }, 'hashtags_rule');
});
test('04: row written to the Sheet that differs from the post fails', () => {
  expectFail('04', (n) => { node(n, /Escribir en Sheet/)[0].tema = 'otro'; }, 'sheet_write_matches_posts');
});
test('04: fewer posts than sheet rows fails', () => {
  expectFail('04', (n) => { n['Formatear Posts'] = []; }, 'one_post_per_row');
});

// ---- 05 ----
test('05: report with a different order total fails', () => {
  expectFail('05', (n) => {
    const o = node(n, /Armar reporte/)[0];
    o.report_html = o.report_html.replace(/(<div class="value">)\d+(<\/div><div class="label">Pedidos totales)/, '$199$2');
  }, 'kpi_orders_total');
});
test('05: stats that disagree with the orders list fail', () => {
  expectFail('05', (n) => { node(n, /GET \/stats/)[0].orders.total = 7; }, 'stats_orders_match_orders_list');
});
test('05: top product with wrong units fails', () => {
  expectFail('05', (n) => { node(n, /GET \/stats/)[0].topProducts[0].units = 99; }, 'top_products');
});
test('05: web interactions altered in the source fail', () => {
  expectFail('05', (n) => { node(n, /GET \/stats/)[0].webInteractions[0].count = 1; }, 'web_interactions');
});
test('05: unique customers altered fail', () => {
  expectFail('05', (n) => {
    const orders = node(n, /GET \/orders/);
    orders.push({ ...orders[0], id: 'x2', customer_email: 'otro@example.test' });
  }, 'kpi_unique_customers');
});

// ---- 06a ----
test('06a: email without the subscriber name fails', () => {
  expectFail('06a', (n) => {
    const o = node(n, /Generar Email HTML/)[3];
    o.html = o.html.replace(`Hola ${o.nombre},`, 'Hola,');
  }, 'email_personalised_per_subscriber');
});
test('06a: a missing email (9 for 10 subscribers) fails', () => {
  expectFail('06a', (n) => { node(n, /Generar Email HTML/).pop(); }, 'one_email_per_subscriber');
});
test('06a: wrong category segmentation fails', () => {
  expectFail('06a', (n) => { node(n, /Segmentar/)[1].categoria = 'roja'; }, 'segmentation_matches_subscribers');
});
test('06a: sending nothing fails', () => {
  expectFail('06a', (n) => { node(n, /Gmail/).length = 0; }, 'delivery_matches_limit');
});

// ---- 06b ----
test('06b: discount computed with another percentage fails', () => {
  expectFail('06b', (n) => { node(n, /Generar Email Descuento/)[1].descuento = 999; }, 'discount_is_10_percent');
});
test('06b: email listing a product not in the cart fails', () => {
  expectFail('06b', (n) => {
    const o = node(n, /Generar Email Descuento/)[1];
    o.html = o.html.replace('Tomate Entero Pelado', 'Salsa Clásica');
  }, 'email_lists_exactly_cart_products');
});
test('06b: cart product outside the catalogue fails', () => {
  expectFail('06b', (n) => { node(n, /Agrupar por cliente/)[0].productos_carrito = ['Producto Fantasma']; }, 'cart_products_in_catalogue');
});
test('06b: customers not derived from the fetched posts fail', () => {
  expectFail('06b', (n) => { node(n, /Agrupar por cliente/).pop(); }, 'customers_from_source');
});
test('06b: final total not matching html fails', () => {
  expectFail('06b', (n) => {
    const o = node(n, /Generar Email Descuento/)[0];
    o.html = o.html.replace(`$${o.total_final}`, '$1');
  }, 'email_states_totals');
});

// ---- 02 / 07 cross-checks added on top of the original criteria ----
test('02: report score that differs from the PSI category fails', () => {
  expectFail('02', (n) => { node(n, /Generar Reporte SEO/)[0].mobileScore = 10; }, 'report_scores_match_psi');
});
test('07: dispatch summary that omits the order fails', () => {
  expectFail('07', (n) => {
    const o = node(n, /Generar Resumen/)[0];
    o.summary_html = o.summary_html.replace(/#cm\w+/, '#xxxx');
  }, 'summary_lists_orders');
});
test('02: alert flag inconsistent with the scores fails', () => {
  expectFail('02', (n) => { node(n, /Generar Reporte SEO/)[0].alerta = true; }, 'alert_rule');
});
