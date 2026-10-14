// Runs the Code nodes of workflow 06b that sit on the abandoned-cart path
// ("Validar carrito", "Simular payload del frontend", "Generar Email Descuento")
// outside n8n, straight from the exported JSON, with a fake $input.
// The payload contract is what frontend/src/features/cart/CartContext.tsx sends:
// { items: CartItem[], sessionId: string | null, timestamp: ISO string }.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const wf = JSON.parse(readFileSync(new URL('../workflows/06b._Carrito_Abandonado.json', import.meta.url), 'utf8'))
const code = name => wf.nodes.find(n => n.name === name).parameters.jsCode

function runEach(name, json) {
  const $input = { item: { json } }
  const out = new Function('$input', code(name))($input)
  return out.json
}
const validar = body => runEach('Validar carrito', { headers: {}, query: {}, body })
const email = json => runEach('Generar Email Descuento', json)

const ITEM = { id: 'p1', name: 'Doble Concentrado de Tomate', line: 'roja', size: '400 g', qty: 2, stockForSize: 50 }
const PAYLOAD = { items: [ITEM], sessionId: 'sess-1', timestamp: '2026-10-14T12:00:00.000Z' }

// ---------------------------------------------------------------- Validar carrito
test('accepts the exact payload the frontend sends and keeps the cart items', () => {
  const r = validar(PAYLOAD)
  assert.equal(r.valid, true)
  assert.deepEqual(r.items, [{ id: 'p1', name: 'Doble Concentrado de Tomate', line: 'roja', size: '400 g', qty: 2 }])
  assert.equal(r.sessionId, 'sess-1')
  assert.equal(r.timestamp, '2026-10-14T12:00:00.000Z')
})

test('accepts a null sessionId (sessionStorage.getItem returns null when unset)', () => {
  assert.equal(validar({ ...PAYLOAD, sessionId: null }).valid, true)
})

test('rejects a body that is not an object', () => {
  for (const body of [undefined, null, 'x', 42, []]) assert.equal(validar(body).valid, false)
})

test('rejects an empty or missing items array', () => {
  assert.equal(validar({ ...PAYLOAD, items: [] }).valid, false)
  assert.equal(validar({ sessionId: 's', timestamp: PAYLOAD.timestamp }).valid, false)
  assert.match(validar({ ...PAYLOAD, items: [] }).error, /items/)
})

test('rejects an item without name, with a non-positive qty or a non-integer qty', () => {
  assert.equal(validar({ ...PAYLOAD, items: [{ ...ITEM, name: '' }] }).valid, false)
  assert.equal(validar({ ...PAYLOAD, items: [{ ...ITEM, qty: 0 }] }).valid, false)
  assert.equal(validar({ ...PAYLOAD, items: [{ ...ITEM, qty: 1.5 }] }).valid, false)
  assert.equal(validar({ ...PAYLOAD, items: [{ ...ITEM, qty: '2' }] }).valid, false)
})

test('rejects one malformed item even when the others are fine', () => {
  const r = validar({ ...PAYLOAD, items: [ITEM, { ...ITEM, id: undefined }] })
  assert.equal(r.valid, false)
  assert.match(r.error, /items\[1\]/)
})

test('rejects a timestamp that is not a date', () => {
  assert.equal(validar({ ...PAYLOAD, timestamp: 'ayer' }).valid, false)
})

test('keeps an optional contact (nombre, email) when the payload carries one', () => {
  const r = validar({ ...PAYLOAD, contact: { nombre: 'Ana', email: 'ana@example.com' } })
  assert.equal(r.nombre, 'Ana')
  assert.equal(r.email, 'ana@example.com')
})

test('has empty nombre and email when the anonymous cart carries no contact', () => {
  const r = validar(PAYLOAD)
  assert.equal(r.nombre, '')
  assert.equal(r.email, '')
})

test('does not carry unknown fields of the items (stockForSize) into the result', () => {
  assert.equal('stockForSize' in validar(PAYLOAD).items[0], false)
})

// ---------------------------------------------------------------- Generar Email Descuento
const VALID = { valid: true, items: [
  { id: 'p1', name: 'Doble Concentrado de Tomate', line: 'roja', size: '400 g', qty: 2 },
  { id: 'p2', name: 'Mitades de Durazno en Almíbar', line: 'dorada', size: '800 g', qty: 1 },
], sessionId: 'sess-1', timestamp: '2026-10-14T12:00:00.000Z', nombre: '', email: '' }

const listed = html => [...html.matchAll(/<li[^>]*>🥫 <strong>(.*?)<\/strong> — (.*?)<\/li>/g)].map(m => ({ name: m[1], rest: m[2] }))

test('the e-mail lists exactly the cart items of the payload, with presentation and quantity', () => {
  const { html } = email(VALID)
  const li = listed(html)
  assert.deepEqual(li.map(l => l.name), ['Doble Concentrado de Tomate', 'Mitades de Durazno en Almíbar'])
  assert.match(li[0].rest, /400 g × 2/)
  assert.match(li[1].rest, /800 g × 1/)
})

test('a different cart produces a different list (not a fixed catalogue)', () => {
  const { html } = email({ ...VALID, items: [{ id: 'z', name: 'Salsa Clásica', line: 'roja', size: '500 g', qty: 7 }] })
  assert.deepEqual(listed(html).map(l => l.name), ['Salsa Clásica'])
  assert.match(html, /500 g × 7/)
})

test('offers 10% off without inventing prices (the cart has none)', () => {
  const { html } = email(VALID)
  assert.match(html, /10% OFF/)
  assert.doesNotMatch(html, /\$\s?\d/)
})

test('states the total number of units of the cart', () => {
  assert.match(email(VALID).html, /3 unidades/)
})

test('greets by name when known and generically otherwise', () => {
  assert.match(email({ ...VALID, nombre: 'Ana' }).html, /Hola Ana,/)
  assert.match(email(VALID).html, /Hola,/)
})

test('escapes HTML coming from the payload', () => {
  const { html } = email({ ...VALID, nombre: '<b>x</b>', items: [{ ...VALID.items[0], name: '<script>1</script>' }] })
  assert.doesNotMatch(html, /<script>1/)
  assert.doesNotMatch(html, /<b>x<\/b>/)
  assert.match(html, /&lt;script&gt;1&lt;\/script&gt;/)
})

test('returns the subject and the items so later nodes and oracles can check them', () => {
  const r = email(VALID)
  assert.match(r.asunto, /Carrito abandonado/)
  assert.deepEqual(r.items, VALID.items)
  assert.equal(r.descuento_pct, 10)
})

// ---------------------------------------------------------------- Simular payload del frontend
const SIM = { cliente_id: 3, email: 'cliente3@ejemplo.com', nombre: 'Cliente 3', productos_carrito: ['Tomate Entero Pelado', 'Mitades de Durazno en Almíbar'], total_carrito: 3700, tiempo_abandono: '3h', ciudad: 'Mendoza' }
const sim = json => runEach('Simular payload del frontend', json)

test('simulated carts have exactly the shape the validator accepts', () => {
  const { body } = sim(SIM)
  const r = validar(body)
  assert.equal(r.valid, true, r.error)
  assert.deepEqual(r.items.map(i => i.name), SIM.productos_carrito)
})

test('simulated carts are deterministic and keep the simulated customer', () => {
  assert.deepEqual(sim(SIM).body.items, sim(SIM).body.items)
  const { body } = sim(SIM)
  assert.equal(body.contact.nombre, 'Cliente 3')
  assert.equal(body.contact.email, 'cliente3@ejemplo.com')
})

// ---------------------------------------------------------------- workflow wiring
test('has an enabled production webhook for the frontend on path abandoned-cart', () => {
  const hook = wf.nodes.find(n => n.type === 'n8n-nodes-base.webhook' && n.parameters.path === 'abandoned-cart')
  assert.ok(hook && !hook.disabled)
  assert.equal(hook.parameters.httpMethod, 'POST')
  assert.equal(hook.parameters.responseMode, 'responseNode')
})

test('the webhook and the Manual Trigger both go through the validator', () => {
  const to = from => wf.connections[from].main[0].map(c => c.node)
  assert.deepEqual(to('Webhook — Carrito Abandonado (TESIS)'), ['Validar carrito'])
  assert.deepEqual(to('Simular payload del frontend'), ['Validar carrito'])
})

test('an invalid payload is answered with 400 and never reaches the e-mail node', () => {
  const ifNode = wf.connections['¿Payload válido?'].main
  assert.equal(ifNode[1][0].node, 'Responder 400 (payload inválido)')
  const resp = wf.nodes.find(n => n.name === 'Responder 400 (payload inválido)')
  assert.equal(resp.parameters.options.responseCode, 400)
  assert.equal(wf.connections['Responder 400 (payload inválido)'], undefined)
})
