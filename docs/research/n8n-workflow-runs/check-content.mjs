// Content check for a batch of `n8n execute --rawOutput` logs.
//
// "No execution error" is not enough: on 25/09/2026 workflow 02 finished without
// error while reporting three Lighthouse categories as 0/100. For every log this
// script records which trigger actually started the run (n8n execute starts the
// first trigger on the canvas, which may be a schedule rather than the Manual
// Trigger), the item count of every executed node, and the verdict of a
// per-workflow ORACLE: a set of named checks that compare the workflow's output
// against its own input, both read from the same execution JSON. An oracle never
// accepts "some element was returned". See ORACLES.md for what each one does and
// does not verify.
//
// Output: <batch>/content.csv and a console table.
// Usage: node check-content.mjs results/<batch>
// Library: `import { ORACLES, loadNodes } from './check-content.mjs'` (used by the tests).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function parseLog(file) {
  const raw = fs.readFileSync(file, 'utf8');
  // The execution JSON starts on a line that is just "{" (LF or CRLF endings).
  const start = raw.search(/^\{\r?$/m);
  if (start < 0) return null;
  try { return JSON.parse(raw.slice(start, raw.lastIndexOf('}') + 1)); } catch { return null; }
}

// Binary metadata (file name, MIME type, size) is kept under `__binary`: the remito PDFs of 07 and the
// palette file of 01 are verified through it.
const items = (run) => (run?.data?.main ?? []).flatMap((out) => out ?? []).map((i) => (i.binary ? { ...(i.json ?? {}), __binary: i.binary } : (i.json ?? {})));
const isTrigger = (name) => /trigger|schedule|cron|every \d|webhook|form/i.test(name);

// Execution log -> { nodeName: [item json, ...] } in execution order.
export function nodesOf(runData) {
  const ordered = Object.entries(runData).sort((a, b) => a[1][0].startTime - b[1][0].startTime);
  return Object.fromEntries(ordered.map(([name, runs]) => [name, items(runs[0])]));
}
export function loadNodes(file) {
  const log = parseLog(file);
  if (!log?.data?.resultData?.runData) throw new Error(`no execution JSON in ${file}`);
  return nodesOf(log.data.resultData.runData);
}

// ---------------------------------------------------------------- oracle helpers
const chk = (name, pass, detail = '') => ({ name, pass: Boolean(pass), detail: String(detail) });
const verdict = (checks, notes = []) => ({ pass: checks.every((c) => c.pass), checks, notes });
const get = (n, re) => Object.entries(n).find(([k]) => re.test(k))?.[1] ?? [];
const has = (n, re) => Object.keys(n).some((k) => re.test(k));
// Run `fn(row, i)` for i in 0..count-1; it returns '' when fine or a problem text.
function perRow(count, fn) {
  const problems = [];
  for (let i = 0; i < count; i++) {
    const p = fn(i);
    if (p) problems.push(`#${i + 1}: ${p}`);
  }
  return { ok: problems.length === 0, detail: problems.length ? problems.slice(0, 3).join(' | ') : `${count} row(s) verified` };
}
const sent = (it) => Array.isArray(it?.labelIds) && it.labelIds.includes('SENT');
const deliveredCheck = (items_, what) =>
  chk('delivered', items_.length > 0 && items_.every(sent), `${items_.length} Gmail item(s) with label SENT (${what})`);

// ---------------------------------------------------------------- 01 Automated Branding
const IGNORED = ['#000000', '#ffffff', '#000', '#fff'];
function colourCounts(html) {
  const counts = new Map();
  const bump = (hex) => { if (!IGNORED.includes(hex)) counts.set(hex, (counts.get(hex) ?? 0) + 1); };
  for (const m of html.matchAll(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/g)) {
    bump('#' + [m[1], m[2], m[3]].map((x) => parseInt(x).toString(16).padStart(2, '0')).join(''));
  }
  for (const m of html.matchAll(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})(?![A-Fa-f0-9])/g)) bump(m[0].toLowerCase());
  return counts;
}
function oracle01Core(n) {
  const out = get(n, /^Extract Colors/)[0] ?? {};
  const src = get(n, /^Fetch HTML/)[0] ?? {};
  const html = String(src.html || src.data || src.body || src.content || '');
  const palette = Array.isArray(out.palette) ? out.palette : [];
  const counts = colourCounts(html);
  const inPalette = new Set(palette);
  const cnt = (h) => counts.get(h) ?? 0;
  const maxOutside = Math.max(0, ...[...counts].filter(([h]) => !inPalette.has(h)).map(([, c]) => c));
  const setNode = [...get(n, /^Set (Thesis|Hardcoded) URL/), ...get(n, /^Form Trigger/)][0] ?? {};
  const bg = out.background;
  const checks = [
    chk('source_html_captured', html.length > 1000 && /<html/i.test(html), `analysed HTML: ${html.length} chars`),
    chk('palette_valid_hex', palette.length >= 1 && palette.length <= 5 && new Set(palette).size === palette.length
      && palette.every((h) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(h)), `palette: ${palette.join(' ')}`),
    chk('palette_in_source', palette.length > 0 && palette.every((h) => counts.has(h)),
      `occurrences in the captured HTML: ${palette.map((h) => `${h}=${cnt(h)}`).join(' ')}`),
    chk('palette_is_top_by_frequency',
      palette.length === Math.min(5, counts.size)
        && palette.every((h, i) => i === 0 || cnt(palette[i - 1]) >= cnt(h))
        && palette.every((h) => cnt(h) >= maxOutside),
      `palette size ${palette.length} of ${counts.size} distinct colours; best excluded colour appears ${maxOutside} time(s)`),
    chk('excludes_black_white', palette.every((h) => !IGNORED.includes(h)), ''),
    chk('primary_secondary_consistent',
      out.primary === (palette[0] ?? null) && out.secondary === (palette[1] ?? null),
      `primary=${out.primary} secondary=${out.secondary}`),
    chk('email_shows_palette_and_url',
      typeof out.emailHtml === 'string' && palette.every((h) => out.emailHtml.includes(h))
        && Boolean(setNode.url) && out.url === setNode.url && out.emailHtml.includes(out.url),
      `analysed url ${out.url} (trigger url ${setNode.url})`),
    chk('background_in_source', bg === 'not detected' || html.toLowerCase().includes(String(bg).toLowerCase()),
      bg === 'not detected' ? 'no body background detected (nothing to verify)' : `background ${bg}`),
    deliveredCheck(get(n, /^Send Email/), 'palette email'),
  ];
  return verdict(checks);
}

// ---------------------------------------------------------------- 02 Website Health & SEO (original criteria + cross-check)
function oracle02(n) {
  const cats = ['performance', 'accessibility', 'best-practices', 'seo'];
  const lh = (node) => get(n, new RegExp(`^${node}$`))[0]?.lighthouseResult?.categories ?? {};
  const missing = ['PSI Mobile', 'PSI Desktop'].flatMap((node) => cats.filter((c) => !lh(node)[c]).map((c) => `${node}:${c}`));
  const r = get(n, /Reporte SEO/)[0];
  const keys = ['mobileScore', 'desktopScore', 'mobileAccess', 'desktopAccess', 'mobileBP', 'desktopBP', 'mobileSEO', 'desktopSEO'];
  const nonNumeric = r ? keys.filter((k) => typeof r[k] !== 'number') : keys;
  // Report fields come from the PSI category scores (0..1) as round(score * 100).
  const map = [['Mobile', 'PSI Mobile'], ['Desktop', 'PSI Desktop']].flatMap(([p, node]) => [
    [`${p.toLowerCase()}Score`, lh(node).performance], [`${p.toLowerCase()}Access`, lh(node).accessibility],
    [`${p.toLowerCase()}BP`, lh(node)['best-practices']], [`${p.toLowerCase()}SEO`, lh(node).seo]]);
  const wrong = r ? map.filter(([k, c]) => c && r[k] !== Math.round(c.score * 100)).map(([k]) => k) : keys;
  return verdict([
    chk('psi_returned_all_categories', missing.length === 0, missing.length ? `missing: ${missing.join(' ')}` : '4 categories x 2 strategies'),
    chk('report_has_numeric_scores', Boolean(r) && nonNumeric.length === 0, nonNumeric.length ? `non-numeric: ${nonNumeric.join(' ')}` : 'all 8 scores numeric'),
    chk('report_scores_match_psi', Boolean(r) && wrong.length === 0, wrong.length ? `differ from PSI: ${wrong.join(' ')}` : '8 scores equal round(PSI score x 100)'),
    chk('report_html_shows_scores', Boolean(r) && keys.every((k) => String(r.htmlEmail).includes(`${r[k]}/100`)), 'every score appears as N/100 in the e-mail'),
    // Workflow rule: alert iff a measured performance score is below 80.
    chk('alert_rule', Boolean(r) && r.alerta === [r.mobileScore, r.desktopScore].some((s) => s < 80)
      && r.estado === (r.alerta ? 'ATENCION REQUERIDA' : 'OK')
      && (r.alerta ? get(n, /^Log Alerta/).length > 0 : get(n, /^Log OK/).length > 0),
      r ? `alerta=${r.alerta} estado=${r.estado} (mobile ${r.mobileScore}, desktop ${r.desktopScore})` : 'no report'),
  ]);
}

// ---------------------------------------------------------------- 03 Google Maps Reputation
const URGENT_WORDS = ['demora', 'roto', 'pésimo', 'horrible'];
function oracle03(n) {
  const input = get(n, /Mock Reviews/);
  const res = get(n, /Process All Reviews/)[0]?.all_reviews ?? [];
  const mail = get(n, /Build Email/)[0] ?? {};
  // Rule from the workflow's own code: >=4 stars -> auto_reply; otherwise escalate,
  // as urgent iff the comment contains one of the urgent words.
  const expected = input.map((r) => {
    const positive = r.starRating >= 4;
    const urgent = !positive && URGENT_WORDS.some((w) => (r.comment || '').toLowerCase().includes(w));
    return { positive, urgent, action: positive ? 'auto_reply' : urgent ? 'urgent_admin' : 'notify_admin' };
  });
  const pos = expected.filter((e) => e.positive).length;
  const urg = expected.filter((e) => e.urgent).length;
  const neg = expected.length - pos;
  const kpi = (label) => Number((mail.html_body ?? '').match(new RegExp(`<b>(\\d+)</b><br>${label}`))?.[1]);
  const cls = perRow(input.length, (i) => {
    const r = res[i]; const e = expected[i]; const src = input[i];
    if (!r) return 'no result';
    if (r.action !== e.action) return `${src.reviewId} (${src.starRating} stars): action ${r.action}, expected ${e.action}`;
    if (r.priority !== (e.urgent ? 'urgent' : 'normal')) return `${src.reviewId}: priority ${r.priority}`;
    if (e.positive) {
      if (!r.tesis_reply?.includes(src.reviewerDisplayName) || r.escalation_suggestion !== null) return `${src.reviewId}: positive review needs a reply naming the reviewer and no escalation`;
    } else if (r.tesis_reply !== null || !r.escalation_suggestion?.includes(src.reviewerDisplayName)) {
      return `${src.reviewId}: negative review needs an escalation naming the reviewer and no auto-reply`;
    }
    return '';
  });
  const subject = `[Golden Harvest] Reseñas Google Maps — ${pos} positivas, ${neg} negativas${urg ? ', ' + urg + ' URGENTES' : ''}`;
  const checks = [
    chk('input_reviews_present', input.length > 0 && input.every((r) => Number.isInteger(r.starRating) && r.starRating >= 1 && r.starRating <= 5),
      `${input.length} mock review(s)`),
    chk('one_result_per_review', res.length === input.length && input.every((r, i) => res[i]?.reviewId === r.reviewId),
      `${input.length} reviews in, ${res.length} classified`),
    chk('fields_preserved', input.every((r, i) => res[i]?.stars === r.starRating && res[i]?.comment === r.comment && res[i]?.reviewer === r.reviewerDisplayName), ''),
    chk('classification_follows_rating', cls.ok, cls.detail),
    chk('summary_counts_match_input',
      mail.summary?.total === input.length && mail.summary?.positivas === pos && mail.summary?.negativas === neg && mail.summary?.urgentes === urg,
      `expected total ${input.length}, positivas ${pos}, negativas ${neg}, urgentes ${urg}; got ${JSON.stringify(mail.summary)}`),
    chk('email_subject_matches', mail.subject === subject, mail.subject ?? 'no subject'),
    chk('email_kpis_match', kpi('Total') === input.length && kpi('Positivas') === pos && kpi('Negativas') === neg && kpi('Urgentes') === urg,
      `html KPIs: ${kpi('Total')}/${kpi('Positivas')}/${kpi('Negativas')}/${kpi('Urgentes')}`),
    chk('email_lists_every_review',
      input.every((r) => (mail.html_body ?? '').includes(r.reviewerDisplayName) && (mail.html_body ?? '').includes(r.comment)), ''),
    deliveredCheck(get(n, /Send a message/), 'review report'),
  ];
  return verdict(checks);
}

// ---------------------------------------------------------------- 04 Social Media Content Engine (Sheet mode)
const BASE_TAGS = ['agro', 'agricultura', 'campo', 'agronegocio', 'cosecha', 'conservas', 'hortalizas', 'mendoza', 'argentina', 'export', 'calidad', 'sustentable', 'goldenharvestsa'];
function expectedTags(producto, descripcion) {
  const words = (`${producto} ${descripcion}`.toLowerCase().match(/[a-záéíóúüñ]{4,}/gi) || []);
  const kw = [...new Set(words)].filter((w) => !['para', 'como', 'este', 'esta', 'con', 'los', 'las', 'una', 'que'].includes(w)).slice(0, 5).map((w) => '#' + w);
  return [...new Set([...kw, ...BASE_TAGS.map((t) => '#' + t)])];
}
function oracle04Core(n) {
  const rows = get(n, /^Leer Sheet de Contenido/);
  const posts = get(n, /^Formatear Posts/);
  const writes = get(n, /^Escribir en Sheet/);
  const ok = (fn) => perRow(rows.length, (i) => (posts[i] ? fn(rows[i], posts[i], writes[i], i) : 'no post for this row'));
  const checks = [
    chk('one_post_per_row', rows.length > 0 && posts.length === rows.length && writes.length === rows.length,
      `${rows.length} Sheet row(s) read, ${posts.length} formatted, ${writes.length} written back (oracle defined for Sheet mode only)`),
  ];
  const identity = ok((r, p) => (p.row_number === r.row_number && p.producto === r.tema ? '' : `row ${r.row_number}: producto "${p.producto}" vs tema "${r.tema}"`));
  checks.push(chk('row_identity_preserved', identity.ok, identity.detail));
  const posts_ = ok((r, p) => {
    const tags = expectedTags(r.tema, r.descripcion);
    const short = r.descripcion.length > 120 ? r.descripcion.substring(0, 117) + '...' : r.descripcion;
    const fecha = r.fecha_publicacion || 'A confirmar';
    if (!p.post_instagram?.includes(r.tema) || !p.post_instagram.includes(r.descripcion)) return 'instagram lacks product or description';
    if (!p.post_whatsapp?.includes(r.tema) || !p.post_whatsapp.includes(short)) return 'whatsapp lacks product or (shortened) description';
    if (!p.post_facebook?.includes(r.tema) || !p.post_facebook.includes(r.descripcion) || !p.post_facebook.includes(fecha)) return 'facebook lacks product, description or date';
    if (/undefined|null|NaN/.test(p.post_instagram + p.post_whatsapp + p.post_facebook)) return 'placeholder leaked into a post';
    if (!p.post_instagram.includes(tags.slice(0, 10).join(' ')) || !p.post_whatsapp.includes(tags.slice(0, 5).join(' '))) return 'hashtags not embedded in the posts';
    return '';
  });
  const tagsRule = ok((r, p) => (p.hashtags === expectedTags(r.tema, r.descripcion).join(' ') ? '' : `hashtags "${p.hashtags}"`));
  const imageRule = ok((r, p) => {
    const seed = r.tema.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20) || 'harvest';
    const want = (r.imagen_url || '').trim() || `https://picsum.photos/seed/${seed}/800/600`;
    return p.imagen_url_final === want && p.post_instagram.includes(want) && p.post_facebook.includes(want) ? '' : `image ${p.imagen_url_final}, expected ${want}`;
  });
  const write = ok((r, p, w) => (w && w.row_number === r.row_number && w.tema === p.producto && w.instagram_post === p.post_instagram
    && w.whatsapp_story === p.post_whatsapp && w.facebook_post === p.post_facebook && w.tags_sugeridos === p.hashtags && w.imagen_url === p.imagen_url_final
    ? '' : 'row written back differs from the generated posts'));
  checks.push(
    chk('posts_contain_sheet_fields', posts_.ok, posts_.detail),
    chk('hashtags_rule', tagsRule.ok, tagsRule.detail),
    chk('image_url_rule', imageRule.ok, imageRule.detail),
    chk('sheet_write_matches_posts', write.ok, write.detail),
  );
  return verdict(checks, has(n, /^Aplicar Paleta/) ? [] : ['This export of 04 has no palette node (batches before 14/10/2026): the brand palette of workflow 01 is not an input and palette use cannot be verified.']);
}

// ---------------------------------------------------------------- 05 Monthly Activity Report
const stripNbsp = (s) => String(s).replace(/ /g, ' ');
function oracle05(n) {
  const stats = get(n, /GET \/stats/)[0] ?? {};
  const ordersAll = get(n, /GET \/orders/);
  const merge = get(n, /^Merge/);
  const rep = get(n, /Armar reporte/)[0] ?? {};
  const html = String(rep.report_html ?? '');
  const month = stats.month;
  const monthOrders = ordersAll.filter((o) => o.id && o.estado && String(o.createdAt || '').startsWith(month));
  const kpi = (label) => html.match(new RegExp(`<div class="value">([^<]*)</div><div class="label">${label}`))?.[1];
  const top = [...html.matchAll(/<tr><td><strong>#(\d)<\/strong><\/td><td>(.*?)<\/td><td>.*?<\/td><td style="text-align:center">(\d+)<\/td><\/tr>/g)].map((m) => ({ nombre: m[2], units: Number(m[3]) }));
  const wantTop = (stats.topProducts ?? []).slice(0, 3).map((p) => ({ nombre: p.nombre, units: p.units }));
  const inter = Object.fromEntries((stats.webInteractions ?? []).map((i) => [i.tipo, i.count]));
  const [vistas, carritos, compras] = [inter.vista || 0, inter.carrito || 0, inter.compra || 0];
  const cell = (label) => html.match(new RegExp(`<td>${label}</td><td>([^<]*)</td>`))?.[1];
  const conv = vistas > 0 ? ((compras / vistas) * 100).toFixed(1) : '0.0';
  const priceKeys = new Set(ordersAll.flatMap((o) => Object.keys(o)).filter((k) => /precio|price|monto|amount|revenue|importe/i.test(k)));
  const q = stats.quotes ?? {};
  return verdict([
    chk('stats_shape', /^\d{4}-\d{2}$/.test(month ?? '') && [q.total, q.pending, q.contacted, q.closed, stats.orders?.total].every(Number.isInteger),
      `month ${month}, quotes ${JSON.stringify(q)}, orders ${JSON.stringify(stats.orders)}`),
    chk('stats_quotes_add_up', q.total === q.pending + q.contacted + q.closed, `${q.total} vs ${q.pending}+${q.contacted}+${q.closed}`),
    chk('stats_orders_match_orders_list', stats.orders?.total === monthOrders.length,
      `/stats/monthly says ${stats.orders?.total}, /orders has ${monthOrders.length} order(s) of ${month}`),
    chk('merge_carries_all_inputs', merge.length === 1 + ordersAll.length, `merge: ${merge.length} item(s) for 1 stats + ${ordersAll.length} order(s)`),
    chk('report_month_matches', rep.month === month && html.includes(`Período: ${month}`), `report ${rep.month} vs stats ${month}`),
    chk('kpi_orders_total', Number(kpi('Pedidos totales')) === stats.orders?.total, `report ${kpi('Pedidos totales')} vs stats ${stats.orders?.total}`),
    chk('kpi_unique_customers', Number(kpi('Clientes únicos')) === new Set(monthOrders.map((o) => o.customer_email)).size,
      `report ${kpi('Clientes únicos')} vs ${new Set(monthOrders.map((o) => o.customer_email)).size} distinct e-mail(s) in /orders`),
    chk('top_products', JSON.stringify(top) === JSON.stringify(wantTop), `report ${JSON.stringify(top)} vs stats ${JSON.stringify(wantTop)}`),
    chk('web_interactions', Number(cell('Vistas de producto')) === vistas && Number(cell('Agregados al carrito')) === carritos
      && Number(cell('Compras completadas')) === compras, `report ${cell('Vistas de producto')}/${cell('Agregados al carrito')}/${cell('Compras completadas')} vs stats ${vistas}/${carritos}/${compras}`),
    chk('conversion_rate', cell('Tasa de conversión \\(vista a compra\\)') === `${conv}%`, `report ${cell('Tasa de conversión \\(vista a compra\\)')} vs ${conv}%`),
    chk('revenue_consistent_with_data', priceKeys.size === 0 && /0,00/.test(stripNbsp(kpi('Facturación total') ?? '')),
      priceKeys.size ? `orders carry price field(s) ${[...priceKeys]} but the report ignores them` : `orders carry no price field; report shows ${kpi('Facturación total')} (known limitation, not a measurement)`),
    deliveredCheck(get(n, /Send a message/), 'monthly report'),
  ]);
}

// ---------------------------------------------------------------- 06a Newsletter
const CATEGORIES = ['roja', 'dorada', 'mix'];
const NEWSLETTER_TITLE = { roja: 'Línea Roja: Doble Concentrado de Tomate', dorada: 'Línea Dorada: Duraznos en Almíbar', mix: 'Surtido Golden Harvest' };
function sentCheck(generated, limited, gmail) {
  const same = limited.length > 0 && limited.every((l, i) => l.email === generated[i]?.email);
  return {
    check: chk('delivery_matches_limit', same && gmail.length === limited.length && gmail.every(sent),
      `${gmail.length} Gmail item(s) SENT for ${limited.length} item(s) kept by the Limit node, which are the first ${limited.length} generated`),
    note: `TESIS branch sends ${gmail.length} of ${generated.length} generated e-mails (Limit node).`,
  };
}
function oracle06a(n) {
  const subs = get(n, /^GET /);
  const seg = get(n, /^Segmentar/);
  const mails = get(n, /^Generar Email/);
  const seg_ = perRow(subs.length, (i) => {
    const s = subs[i]; const o = seg[i];
    if (!o) return 'not segmented';
    const want = { email: s.email, nombre: s.name, empresa: s.company?.name || 'Particular', categoria: CATEGORIES[i % 3], ciudad: s.address?.city || 'Buenos Aires' };
    const bad = Object.keys(want).filter((k) => o[k] !== want[k]);
    return bad.length ? `${s.email}: ${bad.join(',')} differ` : '';
  });
  const mail_ = perRow(subs.length, (i) => {
    const s = subs[i]; const m = mails[i];
    if (!m) return 'no e-mail';
    const html = String(m.html ?? '');
    const city = s.address?.city || 'Buenos Aires';
    if (m.email !== s.email || m.nombre !== s.name) return `${s.email}: e-mail addressed to ${m.email}`;
    if (!html.includes(`Hola ${s.name},`)) return `${s.email}: body does not greet ${s.name}`;
    if (!html.includes(`<strong>${city}</strong>`)) return `${s.email}: body lacks city ${city}`;
    if (!html.includes(NEWSLETTER_TITLE[CATEGORIES[i % 3]])) return `${s.email}: body lacks the ${CATEGORIES[i % 3]} product line`;
    if (/undefined|null|NaN/.test(html)) return `${s.email}: placeholder leaked`;
    return '';
  });
  const d = sentCheck(mails, get(n, /^Limitar/), get(n, /^Gmail/));
  return verdict([
    chk('subscribers_fetched', subs.length > 0 && subs.every((s) => s.email && s.name), `${subs.length} simulated subscriber(s)`),
    chk('segmentation_matches_subscribers', seg.length === subs.length && seg_.ok, seg_.detail),
    chk('one_email_per_subscriber', mails.length === subs.length && new Set(mails.map((m) => m.email)).size === subs.length, `${subs.length} subscribers, ${mails.length} e-mail(s) generated`),
    chk('email_personalised_per_subscriber', mail_.ok, mail_.detail),
    d.check,
  ], [d.note]);
}

// ---------------------------------------------------------------- 06b Carrito Abandonado
const CATALOGUE = ['Doble Concentrado de Tomate', 'Tomate Entero Pelado', 'Mitades de Durazno en Almíbar', 'Salsa Clásica', 'Trozos de Durazno en Almíbar'];
function oracle06bLegacy(n) {
  const posts = get(n, /^GET /);
  const carts = get(n, /^Agrupar/);
  const mails = get(n, /^Generar Email/);
  const want = Math.min(8, posts.length);
  const cust = perRow(want, (i) => {
    const c = carts[i];
    if (!c) return 'missing customer';
    return c.cliente_id === posts[i].id && c.email === `cliente${posts[i].id}@ejemplo.com` && c.nombre === `Cliente ${posts[i].id}` ? '' : `customer ${c.cliente_id} does not follow post ${posts[i].id}`;
  });
  const cartProd = perRow(carts.length, (i) => {
    const p = carts[i].productos_carrito;
    return Array.isArray(p) && p.length >= 1 && new Set(p).size === p.length && p.every((x) => CATALOGUE.includes(x)) ? '' : `cart ${JSON.stringify(p)} not in the catalogue`;
  });
  const cartTotal = perRow(carts.length, (i) => {
    const c = carts[i]; const numP = (i % 3) + 1;
    const prods = CATALOGUE.slice(i % 5, (i % 5) + numP);
    return JSON.stringify(c.productos_carrito) === JSON.stringify(prods) && c.total_carrito === Math.round(prods.length * 1850 * (1 + i * 0.1)) ? '' : `cart ${c.cliente_id}: products/total differ from the cart rule`;
  });
  const disc = perRow(carts.length, (i) => {
    const c = carts[i]; const m = mails[i];
    if (!m) return 'no e-mail';
    const d = Math.round(c.total_carrito * 0.10);
    return m.descuento === d && m.total_final === c.total_carrito - d && m.total_carrito === c.total_carrito ? '' : `${c.nombre}: discount ${m.descuento} / final ${m.total_final} for total ${c.total_carrito}`;
  });
  const lists = perRow(carts.length, (i) => {
    const c = carts[i]; const html = String(mails[i]?.html ?? '');
    const li = [...html.matchAll(/<li[^>]*>🥫 (.*?)<\/li>/g)].map((m) => m[1]);
    return JSON.stringify(li) === JSON.stringify(c.productos_carrito) && html.includes(`Hola ${c.nombre},`) && mails[i].email === c.email ? '' : `${c.nombre}: e-mail lists ${JSON.stringify(li)}, cart is ${JSON.stringify(c.productos_carrito)}`;
  });
  const totals = perRow(carts.length, (i) => {
    const c = carts[i]; const m = mails[i]; const html = String(m?.html ?? '');
    return html.includes('10% OFF') && html.includes(`Total original: $${c.total_carrito}`) && html.includes(`Con descuento: $${m.total_final}`) ? '' : `${c.nombre}: e-mail does not state 10% off / $${c.total_carrito} / $${m?.total_final}`;
  });
  const d = sentCheck(mails, get(n, /^Limitar/), get(n, /^Gmail/));
  return verdict([
    chk('customers_from_source', carts.length === want && cust.ok, `${posts.length} posts fetched, ${carts.length} customer(s) built (expected ${want}); ${cust.detail}`),
    chk('cart_products_in_catalogue', cartProd.ok, cartProd.detail),
    chk('cart_follows_generation_rule', cartTotal.ok, cartTotal.detail),
    chk('discount_is_10_percent', mails.length === carts.length && disc.ok, disc.detail),
    chk('email_lists_exactly_cart_products', lists.ok, lists.detail),
    chk('email_states_totals', totals.ok, totals.detail),
    d.check,
  ], [d.note, 'Carts are generated by the workflow itself from jsonplaceholder posts (no real cart exists); the oracle verifies the e-mail against those generated carts.']);
}

// ---------------------------------------------------------------- 07 Logistics (original criteria + cross-check)
function oracle07Legacy(n) {
  const html = JSON.stringify(n);
  const fetched = get(n, /Obtener/);
  const limited = get(n, /^Limitar/);
  const sum = get(n, /Generar Resumen/)[0] ?? {};
  const body = String(sum.summary_html ?? '');
  const lines = perRow(limited.length, (i) => {
    const o = limited[i];
    return body.includes(`#${o.id}`) && body.includes(String(o.customer_nombre)) && body.includes(String(o.localidad)) && body.includes(`${o.total} u.`) ? '' : `order ${o.id} not fully listed`;
  });
  return verdict([
    chk('dispatch_summary_present', /Resumen de despacho/.test(html), ''),
    chk('no_null_in_summary', !/>null</.test(html), ''),
    chk('confirmed_orders_fetched', fetched.length > 0 && fetched.every((o) => o.estado === 'CONFIRMADO'), `${fetched.length} confirmed order(s)`),
    chk('summary_lists_orders', limited.length === Math.min(3, fetched.length) && lines.ok && sum.total === limited.length, `${limited.length} order(s) in summary (total=${sum.total}); ${lines.detail}`),
    deliveredCheck(get(n, /Gmail/), 'dispatch summary'),
  ]);
}

// ---------------------------------------------------------------- receivers + 01 -> 04 (exports of 14/10/2026)
// Each oracle below extends or replaces the earlier one only when the log shows the new nodes; logs of
// the earlier batches (08/10, prereg-14/10) keep being judged by the earlier criteria.
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

// 01: besides the e-mail, the palette must be persisted for 04 (file written, same colours).
function oracle01(n) {
  const base = oracle01Core(n);
  if (!has(n, /^Preparar Paleta/)) return base;
  const out = get(n, /^Extract Colors/)[0] ?? {};
  const prep = get(n, /^Preparar Paleta/)[0] ?? {};
  const wrote = get(n, /^Guardar Paleta/);
  const bin = prep.__binary?.data;
  const extra = [
    chk('palette_saved_for_04',
      Array.isArray(prep.palette) && JSON.stringify(prep.palette) === JSON.stringify(out.palette) && prep.url === out.url
        && !Number.isNaN(Date.parse(prep.extractedAt)) && bin?.fileName === 'brand_palette.json' && bin?.mimeType === 'application/json' && bin?.bytes > 20,
      `saved palette ${(prep.palette ?? []).join(' ')} (${bin?.bytes ?? 0} bytes) vs extracted ${(out.palette ?? []).join(' ')}`),
    chk('palette_file_written', wrote.length === 1 && !wrote[0].error, wrote[0]?.error ? `write failed: ${JSON.stringify(wrote[0].error).slice(0, 200)}` : `${wrote.length} write result(s)`),
  ];
  return verdict([...base.checks, ...extra], base.notes);
}

// 04: the palette read from the file 01 wrote is applied to every post of the same execution.
function oracle04(n, ctx = {}) {
  const base = oracle04Core(n);
  if (!has(n, /^Aplicar Paleta/)) return base;
  const rows = get(n, /^Leer Sheet de Contenido/);
  const applied = get(n, /^Aplicar Paleta/);
  const posts = get(n, /^Formatear Posts/);
  const per = (fn) => perRow(rows.length, (i) => (applied[i] && posts[i] ? fn(applied[i], posts[i]) : 'palette or post missing for this row'));
  const valid = per((a) => (a.palette_source === 'workflow-01' && Array.isArray(a.palette) && a.palette.length >= 1 && a.palette.length <= 5 && a.palette.every((h) => HEX.test(h))
    ? '' : `source ${a.palette_source}, palette ${JSON.stringify(a.palette)}`));
  const used = per((a, p) => {
    const all = (txt) => a.palette.every((h) => txt.includes(h));
    if (!all(p.post_instagram) || !all(p.post_facebook) || !all(p.post_whatsapp)) return `a post lacks a palette colour (${a.palette.join(' ')})`;
    if (!String(p.imagen_prompt).includes(p.producto) || !all(String(p.imagen_prompt))) return `image prompt "${p.imagen_prompt}" lacks product or colours`;
    return JSON.stringify(p.palette) === JSON.stringify(a.palette) ? '' : 'Formatear Posts output carries another palette';
  });
  const checks = [
    chk('palette_read_from_01', valid.ok, valid.detail),
    chk('posts_use_palette', used.ok, used.detail),
  ];
  if (ctx.palette01) {
    checks.push(chk('palette_matches_01_output',
      applied.length > 0 && applied.every((a) => JSON.stringify(a.palette) === JSON.stringify(ctx.palette01)),
      `04 used ${(applied[0]?.palette ?? []).join(' ')}; the last 01 run of the batch extracted ${ctx.palette01.join(' ')}`));
  }
  return verdict([...base.checks, ...checks], ctx.palette01 ? base.notes : [...base.notes, 'No 01 log in the batch: the palette was not compared with the output of workflow 01.']);
}

// 06b: the e-mail lists exactly the cart items of the payload (webhook body, or the simulated payload of the manual path).
const listedItems = (html) => [...String(html).matchAll(/<li[^>]*>🥫 <strong>(.*?)<\/strong> — (?:[^<]*?, )?([^,<]*?) × (\d+)<\/li>/g)].map((m) => ({ name: m[1], size: m[2], qty: Number(m[3]) }));
function oracle06b(n) {
  if (!has(n, /^Validar carrito/)) return oracle06bLegacy(n);
  const hook = get(n, /^Webhook — Carrito Abandonado/);
  const sim = get(n, /^Simular payload/);
  const carts = get(n, /^Agrupar/);
  const bodies = (hook.length ? hook.map((h) => h.body) : sim.map((s) => s.body));
  const validated = get(n, /^Validar carrito/);
  const accepted = validated.filter((v) => v.valid);
  const mails = get(n, /^Generar Email/);
  const sentOk = sentCheck(mails, get(n, /^Limitar/), get(n, /^Gmail/));
  const fromCarts = perRow(hook.length ? 0 : carts.length, (i) => {
    const b = sim[i]?.body; const c = carts[i];
    if (!b) return 'no simulated payload';
    return JSON.stringify(b.items.map((x) => x.name)) === JSON.stringify(c.productos_carrito) && b.contact?.email === c.email ? '' : `${c.nombre}: payload items differ from the simulated cart`;
  });
  const exact = perRow(mails.length, (i) => {
    const want = (bodies[i]?.items ?? []).map((x) => ({ name: esc(x.name), size: esc(x.size), qty: x.qty }));
    const got = listedItems(mails[i].html);
    return want.length > 0 && JSON.stringify(got) === JSON.stringify(want) ? '' : `e-mail #${i + 1} lists ${JSON.stringify(got)}, payload cart is ${JSON.stringify(want)}`;
  });
  const offer = perRow(mails.length, (i) => {
    const m = mails[i]; const units = (bodies[i]?.items ?? []).reduce((s, x) => s + x.qty, 0);
    if (m.descuento_pct !== 10 || !m.html.includes('10% OFF')) return 'does not offer 10% off';
    if (/\$\s?\d/.test(m.html)) return 'invents a price (carts have none)';
    return m.html.includes(`Total: ${units} unidades`) && m.unidades === units ? '' : `units: e-mail says ${m.unidades}, payload has ${units}`;
  });
  const greet = perRow(mails.length, (i) => {
    const nombre = bodies[i]?.contact?.nombre ?? '';
    return mails[i].html.includes(nombre ? `Hola ${esc(nombre)},` : 'Hola,') ? '' : `greeting does not match nombre "${nombre}"`;
  });
  return verdict([
    chk('payloads_present', bodies.length > 0 && bodies.every((b) => b && typeof b === 'object'), `${bodies.length} payload(s) from ${hook.length ? 'the webhook' : 'the simulated cart path'}`),
    chk('simulated_payload_follows_cart', fromCarts.ok, fromCarts.detail),
    chk('payloads_pass_validation', validated.length === bodies.length && accepted.length === validated.length, `${accepted.length} of ${validated.length} payload(s) accepted`),
    chk('invalid_payloads_not_emailed', mails.length === accepted.length, `${accepted.length} accepted payload(s), ${mails.length} e-mail(s) built`),
    chk('email_lists_exactly_payload_items', exact.ok, exact.detail),
    chk('offer_without_invented_prices', offer.ok, offer.detail),
    chk('greeting_matches_contact', greet.ok, greet.detail),
    sentOk.check,
  ], [sentOk.note, hook.length ? 'Payload received by the production webhook.' : 'Manual path: carts are simulated (jsonplaceholder) and converted to the payload the frontend sends; the oracle compares the e-mail with that payload, not with a catalogue.']);
}

// 07: a remito PDF per order, attached to the dispatch e-mail, with the order data in it.
function oracle07(n) {
  if (!has(n, /^Armar Remito/)) return oracle07Legacy(n);
  const html = JSON.stringify(n);
  const hook = get(n, /^Webhook — Orden Confirmada/);
  const fetched = get(n, /^Obtener/);
  const limited = get(n, /^Limitar/);
  const orders = hook.length ? get(n, /^Validar orden/).filter((o) => o.valid) : get(n, /^Completar/);
  const remitos = get(n, /^Armar Remito/);
  const named = get(n, /^Nombrar PDF/);
  const sum = get(n, /Generar Resumen/)[0] ?? {};
  const body = String(sum.summary_html ?? '');
  const items_ = perRow(orders.length, (i) => {
    const o = orders[i];
    const units = (o.items ?? []).reduce((s, x) => s + x.qty, 0);
    if (o.items_error) return `${o.id}: items request failed (${o.items_error})`;
    if (!o.items?.length) return `${o.id}: no items`;
    const ref = hook.length ? o.total : limited[i]?.total;
    return ref === units ? '' : `${o.id}: total ${ref} vs ${units} unit(s) in the items`;
  });
  const content = perRow(orders.length, (i) => {
    const o = orders[i]; const h = String(remitos[i]?.remito_html ?? '');
    if (!h) return `${o.id}: no remito`;
    const miss = [`#${esc(o.id)}`, esc(o.customer_nombre), o.localidad ? `>${esc(o.localidad)}<` : '>Sin informar<',
      `${o.items.reduce((s, x) => s + x.qty, 0)} unidades`, 'Documento no válido como factura — demo académica',
      ...o.items.flatMap((x) => [esc(x.name), esc(x.size)])].filter((t) => !h.includes(t));
    return miss.length ? `${o.id}: remito lacks ${miss.slice(0, 3).join(' | ')}` : '';
  });
  const pdfs = perRow(orders.length, (i) => {
    const b = named[i]?.__binary?.data; const id = orders[i].id;
    return named[i]?.id === id && b?.mimeType === 'application/pdf' && b.fileName === `remito-${id}.pdf` && b.bytes > 5000 ? '' : `${id}: PDF ${JSON.stringify({ f: b?.fileName, m: b?.mimeType, bytes: b?.bytes })}`;
  });
  const keys = Object.keys(sum.__binary ?? {});
  const attached = keys.length === orders.length && orders.every((o, i) => sum.__binary[`remito_${i + 1}`]?.fileName === `remito-${o.id}.pdf` && sum.__binary[`remito_${i + 1}`]?.mimeType === 'application/pdf')
    && sum.adjuntos === keys.join(',') && JSON.stringify((sum.remitos ?? []).map((r) => r.order_id)) === JSON.stringify(orders.map((o) => o.id))
    && orders.every((o) => body.includes(`remito-${o.id}.pdf`));
  const lines = perRow(orders.length, (i) => {
    const o = orders[i];
    return body.includes(`#${o.id}`) && body.includes(String(o.customer_nombre)) && (o.localidad ? body.includes(String(o.localidad)) : body.includes('Sin informar')) && body.includes(`${o.total} u.`) ? '' : `order ${o.id} not fully listed`;
  });
  return verdict([
    chk('dispatch_summary_present', /Resumen de despacho/.test(html), ''),
    chk('no_null_in_summary', !/>null</.test(body), ''),
    chk('orders_received', orders.length > 0 && (hook.length ? true : fetched.length > 0 && fetched.every((o) => o.estado === 'CONFIRMADO') && orders.length === Math.min(3, fetched.length) && limited.length === orders.length),
      hook.length ? `${orders.length} order(s) from the webhook` : `${fetched.length} confirmed order(s) fetched, ${orders.length} kept`),
    chk('items_complete_per_order', items_.ok, items_.detail),
    chk('remito_has_order_data', remitos.length === orders.length && content.ok, content.detail),
    chk('one_pdf_per_order', named.length === orders.length && pdfs.ok, pdfs.detail),
    chk('summary_attaches_every_pdf', attached, `${keys.length} attachment(s) [${keys.join(',')}] for ${orders.length} order(s)`),
    chk('summary_lists_orders', sum.total === orders.length && lines.ok, `${orders.length} order(s) in summary (total=${sum.total}); ${lines.detail}`),
    deliveredCheck(get(n, /Gmail/), 'dispatch summary with PDF remitos'),
  ]);
}

export const ORACLES = {
  '01': oracle01, '02': oracle02, '03': oracle03, '04': oracle04,
  '05': oracle05, '06a': oracle06a, '06b': oracle06b, '07': oracle07,
};


// ---------------------------------------------------------------- batch runner
function main(dir) {
  // Node name -> node type, from the exported workflows, to recognise delivery nodes
  // (Gmail, Google Sheets) whatever they are called on the canvas.
  const WORKFLOWS_DIR = new URL('../../../n8n/workflows/', import.meta.url);
  const nodeType = new Map();
  for (const f of fs.readdirSync(WORKFLOWS_DIR).filter((f) => f.endsWith('.json'))) {
    const wf = JSON.parse(fs.readFileSync(new URL(f, WORKFLOWS_DIR), 'utf8'));
    for (const nd of wf.nodes) nodeType.set(nd.name, nd.type);
  }
  const isDelivery = (name) => /gmail|googleSheets/i.test(nodeType.get(name) ?? name);

  // Palette that the last 01 run of the batch extracted: 04 reads that file (01 runs before 04).
  const last01 = fs.readdirSync(dir).filter((f) => /^01-\d+\.log$/.test(f)).sort().pop();
  let palette01;
  if (last01) { try { palette01 = loadNodes(path.join(dir, last01))['Extract Colors']?.[0]?.palette; } catch { palette01 = undefined; } }

  const rows = [['workflow', 'run', 'status', 'trigger', 'nodes', 'delivered', 'content_ok', 'content_note', 'oracle_checks']];
  for (const file of fs.readdirSync(dir).filter((f) => /^\w+-\d+\.log$/.test(f)).sort()) {
    const [wf, run] = file.replace('.log', '').split('-');
    const log = parseLog(path.join(dir, file));
    const runData = log?.data?.resultData?.runData;
    if (!runData) { rows.push([wf, run, 'no-json', '', 0, false, false, 'log has no execution JSON', '']); continue; }
    const ordered = Object.entries(runData).sort((a, b) => a[1][0].startTime - b[1][0].startTime);
    const trigger = ordered.find(([name]) => isTrigger(name))?.[0] ?? ordered[0][0];
    const nodes = nodesOf(runData);
    const errors = ordered.filter(([, runs]) => runs[0].error).map(([name]) => name);
    // Delivered: a Gmail or Sheets node ran and returned at least one item.
    const delivered = ordered.some(([name, runs]) => isDelivery(name) && !runs[0].error && items(runs[0]).length > 0);
    let ok = false; let note = ''; let tally = '';
    if (errors.length) note = `errors in: ${errors.join(', ')}`;
    else if (!ORACLES[wf]) { ok = true; }
    else {
      const r = ORACLES[wf](nodes, { palette01 });
      ok = r.pass; tally = `${r.checks.filter((c) => c.pass).length}/${r.checks.length}`;
      note = r.checks.filter((c) => !c.pass).map((c) => `${c.name}: ${c.detail}`).join('; ');
    }
    rows.push([wf, run, log.status ?? '', trigger, ordered.length, delivered, ok, note, tally]);
  }
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  fs.writeFileSync(path.join(dir, 'content.csv'), csv + '\n');
  for (const r of rows) console.log(r.join(' | '));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const dir = process.argv[2];
  if (!dir) throw new Error('Usage: node check-content.mjs results/<batch>');
  main(dir);
}
