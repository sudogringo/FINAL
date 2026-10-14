// Workflow 07, TESIS branch: the remito (delivery note) PDF and the real receiver of the
// backend webhook. Runs the Code nodes straight from the exported JSON, outside n8n.
// Payload contract of the webhook: backend/src/routes/quotes.ts (fireWebhook of
// N8N_LOGISTICS_WEBHOOK): { orderId, quoteId, contact, items }, where items are the quote
// items { id, name, line, size, qty } and contact is the quote form (quoteContact.ts).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const wf = JSON.parse(readFileSync(new URL('../workflows/07._Logistics_Shipping_Automation.json', import.meta.url), 'utf8'))
const node = name => wf.nodes.find(n => n.name === name)
const code = name => node(name).parameters.jsCode
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

const eachItem = (name, json) => new Function('$input', code(name))({ item: { json } })
const validar = body => eachItem('Validar orden (webhook)', { headers: {}, query: {}, body }).json
const remito = order => eachItem('Armar Remito HTML', order).json

const PAYLOAD = {
  orderId: 'cmabc123',
  quoteId: 'q9',
  contact: { nombre: 'Ana Pérez', empresa: 'Almacén Sur', telefono: '261 555', email: 'ana@example.com', localidad: 'San Rafael' },
  items: [
    { id: 'p1', name: 'Doble Concentrado de Tomate', line: 'roja', size: '400 g', qty: 12 },
    { id: 'p2', name: 'Mitades de Durazno en Almíbar', line: 'dorada', size: '800 g', qty: 6 },
  ],
}

// ---------------------------------------------------------------- webhook payload
test('accepts the payload the backend fires and normalises it to the order shape', () => {
  const o = validar(PAYLOAD)
  assert.equal(o.valid, true)
  assert.equal(o.id, 'cmabc123')
  assert.equal(o.customer_nombre, 'Ana Pérez')
  assert.equal(o.customer_email, 'ana@example.com')
  assert.equal(o.localidad, 'San Rafael')
  assert.equal(o.total, 18)
  assert.deepEqual(o.items.map(i => [i.name, i.size, i.qty]), [['Doble Concentrado de Tomate', '400 g', 12], ['Mitades de Durazno en Almíbar', '800 g', 6]])
  assert.equal(o.origen, 'webhook')
})

test('a contact without localidad is accepted (the field is optional in the quote form)', () => {
  const { localidad, ...contact } = PAYLOAD.contact
  const o = validar({ ...PAYLOAD, contact })
  assert.equal(o.valid, true)
  assert.equal(o.localidad, null)
})

test('rejects a payload without orderId, contact name or items', () => {
  assert.equal(validar({ ...PAYLOAD, orderId: '' }).valid, false)
  assert.equal(validar({ ...PAYLOAD, contact: { email: 'a@b.c' } }).valid, false)
  assert.equal(validar({ ...PAYLOAD, items: [] }).valid, false)
  assert.equal(validar(undefined).valid, false)
})

test('rejects an item with a non-integer or zero qty', () => {
  assert.equal(validar({ ...PAYLOAD, items: [{ ...PAYLOAD.items[0], qty: 0 }] }).valid, false)
  assert.equal(validar({ ...PAYLOAD, items: [{ ...PAYLOAD.items[0], qty: 'doce' }] }).valid, false)
  assert.match(validar({ ...PAYLOAD, items: [{ ...PAYLOAD.items[0], qty: 0 }] }).error, /items\[0\]\.qty/)
})

// ---------------------------------------------------------------- Manual path: complete the items from the API
function completar(orders, http) {
  const $input = { all: () => orders.map(json => ({ json })) }
  const ctx = { helpers: { httpRequest: http } }
  return new AsyncFunction('$input', '$env', code('Completar ítems de la orden')).call(ctx, $input, { SERVICE_API_KEY: 'k' })
}
const API_ORDER = { id: 'ord1', estado: 'CONFIRMADO', createdAt: '2026-10-10T10:00:00.000Z', customer_nombre: 'Ana Pérez', customer_email: 'ana@example.com', localidad: 'Godoy Cruz', total: 5 }

test('fetches the items of every order from the backend with the service key', async () => {
  const calls = []
  const http = async opts => { calls.push(opts); return [{ cantidad: 5, nombre: 'Salsa Clásica', size: '500 g', product_name: 'Salsa Clásica', product_line: 'roja' }] }
  const out = await completar([API_ORDER, { ...API_ORDER, id: 'ord2' }], http)
  assert.deepEqual(calls.map(c => c.url), ['http://backend:3001/api/orders/ord1/items', 'http://backend:3001/api/orders/ord2/items'])
  assert.equal(calls[0].headers['X-Service-Key'], 'k')
  assert.deepEqual(out[0].json.items, [{ name: 'Salsa Clásica', size: '500 g', qty: 5, line: 'roja' }])
  assert.equal(out[0].json.origen, 'api')
  assert.equal(out[0].json.customer_nombre, 'Ana Pérez')
})

test('keeps the order (without items) when the items request fails', async () => {
  const out = await completar([API_ORDER], async () => { throw new Error('boom') })
  assert.equal(out.length, 1)
  assert.deepEqual(out[0].json.items, [])
  assert.match(out[0].json.items_error, /boom/)
})

// ---------------------------------------------------------------- remito HTML
const ORDER = validar(PAYLOAD)

test('the remito shows order id, date, customer, delivery locality and every item with its units', () => {
  const { remito_html: h } = remito(ORDER)
  assert.match(h, /Remito/)
  assert.match(h, /cmabc123/)
  assert.match(h, /Ana Pérez/)
  assert.match(h, /Almacén Sur/)
  assert.match(h, />San Rafael</)
  assert.match(h, /Doble Concentrado de Tomate/)
  assert.match(h, /Mitades de Durazno en Almíbar/)
  assert.match(h, /400 g/)
  assert.match(h, /18 unidades/)
  assert.match(h, /\d{1,2} de [a-záéíóú]+ de \d{4}/)
})

test('the remito carries the "not valid as an invoice - academic demo" mark', () => {
  assert.match(remito(ORDER).remito_html, /Documento no válido como factura — demo académica/)
})

test('a second order produces a different remito (no hard-coded content)', () => {
  const o2 = validar({ ...PAYLOAD, orderId: 'zzz999', contact: { ...PAYLOAD.contact, nombre: 'Luis Gómez', localidad: 'Maipú' }, items: [{ id: 'x', name: 'Salsa Clásica', line: 'roja', size: '500 g', qty: 3 }] })
  const { remito_html: h } = remito(o2)
  assert.match(h, /zzz999/)
  assert.match(h, /Luis Gómez/)
  assert.match(h, />Maipú</)
  assert.match(h, /3 unidades/)
  assert.doesNotMatch(h, /Doble Concentrado/)
  assert.doesNotMatch(h, /cmabc123/)
})

test('never prints a literal null / undefined; missing localidad says "Sin informar"', () => {
  const { remito_html: h } = remito({ ...ORDER, localidad: null, customer_empresa: undefined })
  assert.doesNotMatch(h, /null|undefined/)
  assert.match(h, />Sin informar</)
})

test('escapes HTML coming from the public quote form', () => {
  const { remito_html: h } = remito({ ...ORDER, customer_nombre: '<img src=x onerror=1>', items: [{ ...ORDER.items[0], name: '<b>X</b>' }] })
  assert.doesNotMatch(h, /<img src=x/)
  assert.doesNotMatch(h, /<b>X<\/b>/)
  assert.match(h, /&lt;img src=x onerror=1&gt;/)
})

test('an order without items says the detail is not available instead of an empty table', () => {
  const { remito_html: h } = remito({ ...ORDER, items: [], total: 5 })
  assert.match(h, /Detalle de ítems no disponible/)
  assert.match(h, /5 unidades/)
})

test('exposes the HTML as a data: URL the Puppeteer node can open, and it decodes back to the same HTML', () => {
  const r = remito(ORDER)
  const prefix = 'data:text/html;charset=utf-8;base64,'
  assert.ok(r.remito_url.startsWith(prefix))
  assert.equal(Buffer.from(r.remito_url.slice(prefix.length), 'base64').toString('utf8'), r.remito_html)
})

test('keeps the order fields so later nodes can pair the PDF with its order', () => {
  const r = remito(ORDER)
  assert.equal(r.id, 'cmabc123')
  assert.equal(r.customer_nombre, 'Ana Pérez')
})

// ---------------------------------------------------------------- name the PDF
function nombrar(order, binary) {
  const $ = () => ({ item: { json: { ...order, remito_html: '<h1/>', remito_url: 'data:x' } } })
  const $input = { item: { json: { statusCode: 200 }, binary } }
  return new Function('$input', '$', code('Nombrar PDF'))($input, $)
}

test('names the PDF remito-<orderId>.pdf and carries the order (without the bulky HTML)', () => {
  const out = nombrar(ORDER, { data: { mimeType: 'application/pdf', fileName: 'x', data: 'AAA' } })
  assert.equal(out.binary.data.fileName, 'remito-cmabc123.pdf')
  assert.equal(out.binary.data.mimeType, 'application/pdf')
  assert.equal(out.json.id, 'cmabc123')
  assert.equal('remito_html' in out.json, false)
  assert.equal('remito_url' in out.json, false)
})

test('fails loudly when Puppeteer returned no PDF for the order', () => {
  assert.throws(() => nombrar(ORDER, undefined), /cmabc123/)
})

// ---------------------------------------------------------------- summary with attachments
function resumen(orders) {
  const $input = { all: () => orders.map(o => ({ json: o, binary: { data: { mimeType: 'application/pdf', fileName: `remito-${o.id}.pdf`, data: 'x' } } })) }
  return new Function('$input', code('Generar Resumen de Despacho'))($input)[0]
}

test('the summary carries one PDF attachment per order, named by order id', () => {
  const r = resumen([ORDER, { ...ORDER, id: 'zzz999' }])
  assert.deepEqual(Object.keys(r.binary), ['remito_1', 'remito_2'])
  assert.equal(r.binary.remito_1.fileName, 'remito-cmabc123.pdf')
  assert.equal(r.binary.remito_2.fileName, 'remito-zzz999.pdf')
  assert.equal(r.json.adjuntos, 'remito_1,remito_2')
  assert.deepEqual(r.json.remitos, [{ order_id: 'cmabc123', archivo: 'remito-cmabc123.pdf' }, { order_id: 'zzz999', archivo: 'remito-zzz999.pdf' }])
})

test('the summary e-mail names the attached remitos', () => {
  assert.match(resumen([ORDER]).json.summary_html, /remito-cmabc123\.pdf/)
})

// ---------------------------------------------------------------- wiring
test('the TESIS branch has an enabled webhook on order-confirmed; the PROD one moved to order-confirmed-prod', () => {
  const hooks = wf.nodes.filter(n => n.type === 'n8n-nodes-base.webhook')
  const tesis = hooks.find(n => !n.disabled)
  assert.equal(tesis.parameters.path, 'order-confirmed')
  assert.equal(tesis.parameters.httpMethod, 'POST')
  assert.equal(tesis.parameters.responseMode, 'responseNode')
  assert.equal(hooks.find(n => n.disabled).parameters.path, 'order-confirmed-prod')
})

test('the PDF is made by the Puppeteer community node (Get PDF, A4 portrait) from the remito data URL', () => {
  const p = wf.nodes.find(n => n.type === 'n8n-nodes-puppeteer.puppeteer')
  assert.equal(p.parameters.operation, 'getPDF')
  assert.equal(p.parameters.url, '={{ $json.remito_url }}')
  assert.equal(p.parameters.format, 'A4')
  assert.equal(p.parameters.landscape, false)
  assert.equal(p.parameters.preferCSSPageSize, false)
  assert.equal(p.parameters.printBackground, true)
})

test('the TESIS Gmail node attaches the PDFs listed by the summary', () => {
  const g = wf.nodes.find(n => n.name === 'Gmail — Enviar Resumen de Despacho (TESIS)')
  assert.equal(g.parameters.options.attachmentsUi.attachmentsBinary[0].property, '={{ $json.adjuntos }}')
})

test('both entries (Manual Trigger and webhook) reach the same remito builder', () => {
  const to = from => (wf.connections[from]?.main ?? []).flat().map(c => c.node)
  assert.deepEqual(to('Limitar a 3 Órdenes (Demo)'), ['Completar ítems de la orden'])
  assert.deepEqual(to('Completar ítems de la orden'), ['Armar Remito HTML'])
  assert.deepEqual(to('Responder 202 (orden recibida)'), ['Armar Remito HTML'])
  assert.deepEqual(to('Armar Remito HTML'), ['Remito PDF (Puppeteer)'])
  assert.deepEqual(to('Remito PDF (Puppeteer)'), ['Nombrar PDF'])
  assert.deepEqual(to('Nombrar PDF'), ['Generar Resumen de Despacho'])
})

test('an invalid webhook payload is answered with 400 and goes no further', () => {
  const ifOut = wf.connections['¿Orden válida?'].main
  assert.equal(ifOut[1][0].node, 'Responder 400 (orden inválida)')
  assert.equal(node('Responder 400 (orden inválida)').parameters.options.responseCode, 400)
  assert.equal(wf.connections['Responder 400 (orden inválida)'], undefined)
})
