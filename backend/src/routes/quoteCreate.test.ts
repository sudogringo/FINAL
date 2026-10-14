import { test } from 'node:test'
import assert from 'node:assert/strict'
import { persistQuote } from './quoteCreate'

const INPUT = {
  sessionId: 's1',
  clientSubmittedAt: '2026-10-14T12:00:00.000Z',
  contact: { nombre: 'Ana', email: 'ana@example.com' } as any,
  items: [{ id: 'p1', name: 'Tomate', line: 'roja', size: '1kg', qty: 2 }],
}

// Fake Prisma: records which client (root or transaction) each write went to.
function fakeDb(opts: { failDelivery?: boolean } = {}) {
  const log: { client: string; op: string; data?: any }[] = []
  const mk = (client: string) => ({
    customer: {
      findUnique: async () => null,
      upsert: async () => { log.push({ client, op: 'customer.upsert' }); return { id: 'c1' } },
    },
    quote: {
      create: async ({ data }: any) => { log.push({ client, op: 'quote.create' }); return { id: 'q1', sessionId: data.sessionId, createdAt: new Date('2026-10-14T12:00:01.000Z') } },
    },
    webhookDelivery: {
      create: async ({ data }: any) => {
        if (opts.failDelivery) throw new Error('outbox down')
        log.push({ client, op: 'webhookDelivery.create', data }); return { id: 'd1', ...data }
      },
    },
  })
  const db = {
    ...mk('root'),
    $transaction: async (fn: (tx: any) => Promise<any>) => { log.push({ client: 'root', op: 'tx.begin' }); return fn(mk('tx')) },
  }
  return { db, log }
}

test('creating a quote enqueues exactly one delivery inside the same transaction', async () => {
  const { db, log } = fakeDb()
  const { quote, delivery } = await persistQuote(db as any, INPUT)
  assert.equal(quote.id, 'q1')
  const writes = log.filter(l => l.op !== 'tx.begin')
  assert.ok(writes.every(w => w.client === 'tx'), 'every write goes through the transaction client')
  const deliveries = log.filter(l => l.op === 'webhookDelivery.create')
  assert.equal(deliveries.length, 1)
  assert.equal(deliveries[0].data.idempotencyKey, 'quote:q1:created')
  assert.equal(deliveries[0].data.target, 'N8N_QUOTE_WEBHOOK')
  assert.equal(deliveries[0].data.payload.quoteId, 'q1')
  assert.equal(deliveries[0].data.payload.clientSubmittedAt, INPUT.clientSubmittedAt)
  assert.equal(delivery.id, 'd1')
})

test('if the outbox write fails the whole persist rejects (the transaction rolls back)', async () => {
  const { db } = fakeDb({ failDelivery: true })
  await assert.rejects(() => persistQuote(db as any, INPUT), /outbox down/)
})

test('a delivery for the measurement mode is parked until the synchronous attempt', async () => {
  const { db, log } = fakeDb()
  const later = new Date('2026-10-14T12:05:00.000Z')
  await persistQuote(db as any, INPUT, { nextAttemptAt: later })
  const d = log.find(l => l.op === 'webhookDelivery.create')!
  assert.deepEqual(d.data.nextAttemptAt, later)
})
