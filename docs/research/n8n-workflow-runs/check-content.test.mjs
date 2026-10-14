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

// ======================================================================================
// Exports of 14/10/2026: 06b real-cart path, 07 remito PDFs, 01 -> 04 palette.
// Batch results/2026-10-14-receivers/ (3 runs each of 01, 04, 06b, 07).
// ======================================================================================
const NEW = new URL('./results/2026-10-14-receivers/', import.meta.url);
const realNew = (wf, n = 1) => loadNodes(new URL(`${wf}-${n}.log`, NEW));
function newPass(wf, n, ctx) {
  const r = ORACLES[wf](realNew(wf, n), ctx);
  assert.deepEqual(failed(r), [], `${wf}-${n}: ${JSON.stringify(r.checks.filter((c) => !c.pass))}`);
  return r;
}
function newFail(wf, mutate, checkName, ctx) {
  const nodes = clone(realNew(wf));
  mutate(nodes);
  const r = ORACLES[wf](nodes, ctx);
  assert.equal(r.pass, false, `${wf}: corrupted copy must fail`);
  assert.ok(failed(r).includes(checkName), `${wf}: expected "${checkName}" to fail, got ${failed(r)}`);
}
const PAL01 = () => realNew('01', 3)['Extract Colors'][0].palette;

for (const wf of ['01', '04', '06b', '07']) {
  test(`${wf} (14/10 exports): passes on the 3 real executions`, () => {
    for (const n of [1, 2, 3]) newPass(wf, n, { palette01: PAL01() });
  });
}

// ---- 01 -> 04 ----
test('01: palette file that was not written (write node errored) fails', () => {
  newFail('01', (n) => { node(n, /Guardar Paleta/)[0] = { error: { message: 'The file or directory does not exist' } }; }, 'palette_file_written');
});
test('01: saved palette different from the extracted one fails', () => {
  newFail('01', (n) => { node(n, /Preparar Paleta/)[0].palette[0] = '#123456'; }, 'palette_saved_for_04');
});
test('04: the palette of 01 is part of the checks when the batch has a 01 log', () => {
  const r = newPass('04', 1, { palette01: PAL01() });
  assert.ok(r.checks.some((c) => c.name === 'palette_matches_01_output'));
});
test('04: a post that lost the palette colours fails', () => {
  newFail('04', (n) => {
    const o = node(n, /Formatear Posts/)[0];
    for (const h of o.palette) o.post_facebook = o.post_facebook.split(h).join('#000001');
  }, 'posts_use_palette');
}) ;
test('04: palette not coming from workflow 01 (default fallback) fails', () => {
  newFail('04', (n) => { node(n, /Aplicar Paleta/)[0].palette_source = 'default'; }, 'palette_read_from_01');
});
test('04: a palette different from the one 01 extracted fails', () => {
  newFail('04', () => {}, 'palette_matches_01_output', { palette01: ['#010203'] });
});
test('04: image prompt without the palette colours fails', () => {
  newFail('04', (n) => { node(n, /Formatear Posts/)[0].imagen_prompt = 'Foto de producto'; }, 'posts_use_palette');
});

// ---- 06b real-cart path ----
test('06b: e-mail listing another quantity than the payload fails', () => {
  newFail('06b', (n) => {
    const o = node(n, /Generar Email Descuento/)[0];
    o.html = o.html.replace(/ × (\d+)<\/li>/, (_, q) => ` × ${Number(q) + 5}</li>`);
  }, 'email_lists_exactly_payload_items');
});
test('06b: e-mail with a product that is not in the payload fails', () => {
  newFail('06b', (n) => {
    const o = node(n, /Generar Email Descuento/)[0];
    o.html = o.html.replace(/<strong>(.*?)<\/strong> —/, '<strong>Producto Fantasma</strong> —');
  }, 'email_lists_exactly_payload_items');
});
test('06b: simulated payload that does not follow its cart fails', () => {
  newFail('06b', (n) => { node(n, /Simular payload/)[0].body.items.pop(); }, 'simulated_payload_follows_cart');
});
test('06b: an e-mail with an invented price fails', () => {
  newFail('06b', (n) => {
    const o = node(n, /Generar Email Descuento/)[0];
    o.html = o.html.replace('10% OFF', '10% OFF — $1500');
  }, 'offer_without_invented_prices');
});
test('06b: an invalid payload that still produced an e-mail fails', () => {
  newFail('06b', (n) => { node(n, /Validar carrito/)[2].valid = false; }, 'invalid_payloads_not_emailed');
});
test('06b: webhook run is judged against the webhook body, not against a catalogue', () => {
  const nodes = {
    'Webhook — Carrito Abandonado (TESIS)': [{ body: { items: [{ id: 'p', name: 'Salsa Clásica', line: 'roja', size: '500 g', qty: 3 }], sessionId: null, timestamp: '2026-10-14T12:00:00.000Z' } }],
    'Validar carrito': [{ valid: true }],
    'Generar Email Descuento': [{ descuento_pct: 10, unidades: 3, html: '<h2>Hola,</h2><ul><li style="padding:4px 0;">🥫 <strong>Salsa Clásica</strong> — Línea Roja, 500 g × 3</li></ul><p><strong>Total: 3 unidades</strong></p>10% OFF' }],
    'Limitar a 1 (TESIS)': [{ email: '' }],
    'Gmail — Enviar Descuento (TESIS)': [{ labelIds: ['SENT'] }],
  };
  nodes['Generar Email Descuento'][0].email = '';
  const ok = ORACLES['06b'](nodes);
  assert.deepEqual(failed(ok), []);
  nodes['Generar Email Descuento'][0].html = nodes['Generar Email Descuento'][0].html.replace('× 3', '× 4');
  assert.ok(failed(ORACLES['06b'](nodes)).includes('email_lists_exactly_payload_items'));
});

// ---- 07 remito PDFs ----
test('07: summary without the PDF attachments fails', () => {
  newFail('07', (n) => { delete node(n, /Generar Resumen/)[0].__binary; }, 'summary_attaches_every_pdf');
});
test('07: a PDF that is not named after its order fails', () => {
  newFail('07', (n) => { node(n, /Nombrar PDF/)[0].__binary.data.fileName = 'remito-otra.pdf'; }, 'one_pdf_per_order');
});
test('07: a PDF with the wrong MIME type or an empty body fails', () => {
  newFail('07', (n) => { node(n, /Nombrar PDF/)[0].__binary.data.bytes = 10; }, 'one_pdf_per_order');
});
test('07: a remito that omits an ordered item fails', () => {
  newFail('07', (n) => {
    const o = node(n, /Armar Remito/)[0];
    const item = node(n, /Completar/)[0].items[0];
    o.remito_html = o.remito_html.split(item.name).join('Otro producto');
  }, 'remito_has_order_data');
});
test('07: a remito without the "not valid as invoice" mark fails', () => {
  newFail('07', (n) => {
    const o = node(n, /Armar Remito/)[0];
    o.remito_html = o.remito_html.replace('Documento no válido como factura — demo académica', '');
  }, 'remito_has_order_data');
});
test('07: items that do not add up to the backend order total fail', () => {
  newFail('07', (n) => { node(n, /Limitar/)[0].total += 1; }, 'items_complete_per_order');
});
test('07: an order whose items request failed fails', () => {
  newFail('07', (n) => { node(n, /Completar/)[0].items_error = 'boom'; }, 'items_complete_per_order');
});
