// Runs the "Generar Resumen de Despacho" Code node of workflow 07 outside n8n,
// straight from the exported JSON, with a fake $input.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const wf = JSON.parse(readFileSync(new URL('../workflows/07._Logistics_Shipping_Automation.json', import.meta.url), 'utf8'))
const node = wf.nodes.find(n => n.name === 'Generar Resumen de Despacho')
const sticky = wf.nodes.find(n => n.type === 'n8n-nodes-base.stickyNote' && n.parameters.content.includes('MODO TESIS'))

function run(orders) {
  const $input = { all: () => orders.map(json => ({ json })) }
  return new Function('$input', node.parameters.jsCode)($input)[0].json
}

const ORDER = { id: 'ord1', customer_nombre: 'Ana Pérez', localidad: 'San Rafael', total: 12 }

test('titles the email as a dispatch summary', () => {
  const { summary_html } = run([ORDER])
  assert.match(summary_html, /Resumen de despacho/)
})

test('prints the localidad when the order has one', () => {
  assert.match(run([ORDER]).summary_html, />San Rafael</)
})

test('never prints a literal null when the customer gave no localidad', () => {
  const { summary_html } = run([{ ...ORDER, localidad: null }])
  assert.doesNotMatch(summary_html, />null</)
  assert.match(summary_html, />Sin informar</)
})

test('escapes HTML coming from the public quote form', () => {
  const { summary_html } = run([{ ...ORDER, customer_nombre: '<a href="x">Ana</a>', localidad: '<b>X</b>' }])
  assert.doesNotMatch(summary_html, /<a href="x">/)
  assert.doesNotMatch(summary_html, /<b>X<\/b>/)
  assert.match(summary_html, /&lt;a href=&quot;x&quot;&gt;Ana&lt;\/a&gt;/)
})

test('the TESIS sticky note describes the remito PDF that is now generated', () => {
  assert.match(sticky.parameters.content, /remito/i)
  assert.match(sticky.parameters.content, /PDF/)
  assert.match(sticky.parameters.content, /order-confirmed/)
})
