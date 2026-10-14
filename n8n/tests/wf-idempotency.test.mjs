// The backend delivers its webhooks at least once (transactional outbox) and sends an
// `Idempotency-Key` header on every POST (e.g. "order:<id>:confirmed", "quote:<id>:created").
// Workflows 00 and 07 (TESIS branch) drop repeated keys with a bounded set kept in the
// workflow static data. This runs the "Deduplicar (Idempotency-Key)" Code node of both.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const load = f => JSON.parse(readFileSync(new URL(`../workflows/${f}`, import.meta.url), 'utf8'))
const WFS = { '00': load('00._Lead_Notification.json'), '07': load('07._Logistics_Shipping_Automation.json') }
const NAME = 'Deduplicar (Idempotency-Key)'

function dedupFor(wf) {
  const code = wf.nodes.find(n => n.name === NAME).parameters.jsCode
  const store = {}
  const run = (headers, extra = {}) => {
    const $input = { item: { json: { headers, body: { x: 1 }, ...extra } } }
    return new Function('$input', '$getWorkflowStaticData', code)($input, () => store).json
  }
  return { run, store }
}

for (const [id, wf] of Object.entries(WFS)) {
  test(`${id}: the first delivery of a key passes, the redelivery is flagged as duplicate`, () => {
    const { run } = dedupFor(wf)
    assert.equal(run({ 'idempotency-key': 'order:o1:confirmed' }).duplicate, false)
    assert.equal(run({ 'idempotency-key': 'order:o1:confirmed' }).duplicate, true)
  })

  test(`${id}: different keys do not collide`, () => {
    const { run } = dedupFor(wf)
    assert.equal(run({ 'idempotency-key': 'order:o1:confirmed' }).duplicate, false)
    assert.equal(run({ 'idempotency-key': 'order:o2:confirmed' }).duplicate, false)
    assert.equal(run({ 'idempotency-key': 'quote:o1:created' }).duplicate, false)
  })

  test(`${id}: a request without the header is processed (never silently dropped)`, () => {
    const { run } = dedupFor(wf)
    assert.equal(run({}).duplicate, false)
    assert.equal(run({}).duplicate, false)
    assert.equal(run({}).idempotency_key, null)
  })

  test(`${id}: the set of seen keys is bounded and forgets the oldest`, () => {
    const { run, store } = dedupFor(wf)
    for (let i = 0; i < 600; i++) run({ 'idempotency-key': `k${i}` })
    assert.ok(store.seenKeys.length <= 500)
    assert.equal(run({ 'idempotency-key': 'k599' }).duplicate, true)
    assert.equal(run({ 'idempotency-key': 'k0' }).duplicate, false)
  })

  test(`${id}: the original item (headers, body) travels on untouched`, () => {
    const { run } = dedupFor(wf)
    const out = run({ 'idempotency-key': 'k' })
    assert.deepEqual(out.body, { x: 1 })
    assert.equal(out.idempotency_key, 'k')
  })

  test(`${id}: duplicates are answered 200 and never reach the processing nodes`, () => {
    const c = wf.connections['¿Duplicado?'].main
    assert.equal(c[0][0].node, 'Responder 200 (duplicado)')
    assert.notEqual(c[1][0].node, 'Responder 200 (duplicado)')
    assert.equal(wf.connections['Responder 200 (duplicado)'], undefined)
    const r = wf.nodes.find(n => n.name === 'Responder 200 (duplicado)')
    assert.equal(r.parameters.options.responseCode, 200)
    const hook = wf.nodes.find(n => n.type === 'n8n-nodes-base.webhook' && !n.disabled)
    assert.deepEqual(wf.connections[hook.name].main[0].map(x => x.node), [NAME])
  })
}
