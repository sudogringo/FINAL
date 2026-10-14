import { test } from 'node:test'
import assert from 'node:assert/strict'
import { runDispatchCycle, attemptDelivery, type DeliveryStore } from './dispatcher'
import type { DeliveryRecord, DeliveryPatch } from './outbox'

const T0 = new Date('2026-10-14T12:00:00.000Z')

function memoryStore(initial: DeliveryRecord[]): DeliveryStore & { rows: DeliveryRecord[] } {
  const rows = initial.map(r => ({ ...r }))
  return {
    rows,
    async claimDue(now, limit, leaseMs) {
      const due = rows.filter(r => r.status === 'PENDING' && r.nextAttemptAt <= now).slice(0, limit)
      due.forEach(r => { r.nextAttemptAt = new Date(now.getTime() + leaseMs) })
      return due.map(r => ({ ...r }))
    },
    async save(id: string, patch: Partial<DeliveryPatch>) {
      Object.assign(rows.find(r => r.id === id)!, patch)
    },
  }
}

function pending(over: Partial<DeliveryRecord> = {}): DeliveryRecord {
  return {
    id: 'd1', eventType: 'quote.created', target: 'N8N_QUOTE_WEBHOOK', payload: { quoteId: 'q1' },
    idempotencyKey: 'quote:q1:created', status: 'PENDING', attempts: 0, nextAttemptAt: T0,
    lastError: null, deliveredAt: null, createdAt: T0, ...over,
  }
}

function harness(rows: DeliveryRecord[], responses: Array<number | Error>) {
  const store = memoryStore(rows)
  const calls: { url: string; init: any }[] = []
  let clock = T0
  const deps = {
    store,
    fetch: (async (url: any, init: any) => {
      calls.push({ url: String(url), init })
      const next = responses.shift() ?? 200
      if (next instanceof Error) throw next
      return new Response('{"ok":true}', { status: next })
    }) as typeof fetch,
    now: () => clock,
    resolveUrl: (t: string) => (t === 'N8N_QUOTE_WEBHOOK' ? 'http://n8n.test/webhook/quote' : undefined),
  }
  return { store, calls, deps, advance: (ms: number) => { clock = new Date(clock.getTime() + ms) } }
}

test('fails twice then succeeds: DELIVERED after 3 attempts, honouring the backoff', async () => {
  const h = harness([pending()], [500, new Error('ECONNREFUSED'), 200])

  await runDispatchCycle(h.deps)
  assert.equal(h.store.rows[0].status, 'PENDING')
  assert.equal(h.store.rows[0].attempts, 1)

  // Todavía no venció el backoff de 30 s: no reintenta.
  h.advance(10_000)
  await runDispatchCycle(h.deps)
  assert.equal(h.calls.length, 1)

  h.advance(30_000)
  await runDispatchCycle(h.deps)
  assert.equal(h.store.rows[0].attempts, 2)
  assert.match(h.store.rows[0].lastError!, /ECONNREFUSED/)

  h.advance(60_000)
  await runDispatchCycle(h.deps)
  assert.equal(h.store.rows[0].status, 'DELIVERED')
  assert.equal(h.store.rows[0].attempts, 3)
  assert.ok(h.store.rows[0].deliveredAt)
  assert.equal(h.calls.length, 3)
})

test('sends the payload as JSON with the Idempotency-Key header and an abort signal', async () => {
  const h = harness([pending()], [200])
  await runDispatchCycle(h.deps)
  const { url, init } = h.calls[0]
  assert.equal(url, 'http://n8n.test/webhook/quote')
  assert.equal(init.method, 'POST')
  assert.equal(init.headers['Idempotency-Key'], 'quote:q1:created')
  assert.equal(init.headers['Content-Type'], 'application/json')
  assert.deepEqual(JSON.parse(init.body), { quoteId: 'q1' })
  assert.ok(init.signal)
})

test('gives up with FAILED once the attempts are exhausted', async () => {
  const h = harness([pending({ attempts: 7 })], [503])
  await runDispatchCycle(h.deps)
  assert.equal(h.store.rows[0].status, 'FAILED')
  assert.equal(h.store.rows[0].attempts, 8)
  assert.match(h.store.rows[0].lastError!, /503/)
})

test('an unset webhook URL marks the delivery SKIPPED without calling fetch', async () => {
  const h = harness([pending({ target: 'N8N_LOGISTICS_WEBHOOK', idempotencyKey: 'order:o1:confirmed' })], [])
  await runDispatchCycle(h.deps)
  assert.equal(h.calls.length, 0)
  assert.equal(h.store.rows[0].status, 'SKIPPED')
  assert.match(h.store.rows[0].lastError!, /N8N_LOGISTICS_WEBHOOK/)
})

test('a cycle keeps going when one delivery throws unexpectedly in the store', async () => {
  const h = harness([pending(), pending({ id: 'd2', idempotencyKey: 'quote:q2:created' })], [200, 200])
  const originalSave = h.store.save
  let first = true
  h.store.save = async (id, patch) => { if (first) { first = false; throw new Error('db down') } return originalSave(id, patch) }
  const processed = await runDispatchCycle(h.deps)
  assert.equal(processed, 2)
  assert.equal(h.store.rows.find(r => r.id === 'd2')!.status, 'DELIVERED')
})

test('attemptDelivery returns the parsed response body of n8n', async () => {
  const h = harness([pending()], [200])
  const out = await attemptDelivery(pending(), h.deps)
  assert.deepEqual(out.body, { ok: true })
  assert.equal(out.patch.status, 'DELIVERED')
})
