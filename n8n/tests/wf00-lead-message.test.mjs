// Runs the "Armar Mensaje (Simulado)" Code node of workflow 00 outside n8n,
// straight from the exported JSON, with a fake $input. Its message_text is
// inserted as HTML in the Gmail node, so the quote-form fields must be escaped.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const wf = JSON.parse(readFileSync(new URL('../workflows/00._Lead_Notification.json', import.meta.url), 'utf8'))
const node = wf.nodes.find(n => n.name === 'Armar Mensaje (Simulado)')

function run(body) {
  const $input = { first: () => ({ json: body }) }
  return new Function('$input', node.parameters.jsCode)($input)[0].json
}

const QUOTE = {
  quoteId: 'q1',
  contact: { nombre: 'Ana Pérez', empresa: 'Almacén Sur', email: 'ana@example.com', telefono: '261' },
  items: [{ qty: 3, name: 'Tomate', line: 'Conservas', size: '1kg' }],
}

test('lists the contact and the requested products', () => {
  const { message_text } = run(QUOTE)
  assert.match(message_text, /Cliente: Ana Pérez/)
  assert.match(message_text, /- 3x Tomate \(Conservas, talle 1kg\)/)
})

test('escapes HTML typed in the public quote form', () => {
  const { message_text } = run({
    ...QUOTE,
    contact: { ...QUOTE.contact, nombre: '<a href="https://x">Ana</a>', empresa: '<b>Sur</b>' },
    items: [{ qty: 1, name: '<img src=x>', line: 'L', size: 'S' }],
  })
  assert.doesNotMatch(message_text, /<a href=/)
  assert.doesNotMatch(message_text, /<b>|<img/)
  assert.match(message_text, /&lt;a href=&quot;https:\/\/x&quot;&gt;Ana&lt;\/a&gt;/)
  assert.match(message_text, /&lt;img src=x&gt;/)
})

test('keeps the line breaks the Gmail node turns into <br>', () => {
  assert.match(run(QUOTE).message_text, /\n\nProductos solicitados:\n/)
})

test('falls back to placeholders when the contact is missing', () => {
  const { message_text } = run({ quoteId: 'q2', items: [] })
  assert.match(message_text, /Cliente: \(sin nombre\)/)
  assert.match(message_text, /Empresa: -/)
})
