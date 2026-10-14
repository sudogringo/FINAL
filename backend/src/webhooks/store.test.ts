import { test } from 'node:test'
import assert from 'node:assert/strict'
import { enqueueDelivery } from './store'
import { orderConfirmedDelivery, quoteCreatedDelivery } from './outbox'

function uniqueClient() {
  const keys = new Set<string>()
  const rows: any[] = []
  return {
    rows,
    webhookDelivery: {
      create: async ({ data }: any) => {
        if (keys.has(data.idempotencyKey)) throw new Error('Unique constraint failed on idempotencyKey')
        keys.add(data.idempotencyKey); rows.push(data); return data
      },
    },
  }
}

test('the same event cannot be enqueued twice (idempotency key is unique)', async () => {
  const c = uniqueClient()
  await enqueueDelivery(c, quoteCreatedDelivery({ quoteId: 'q1', payload: {} }))
  await assert.rejects(() => enqueueDelivery(c, quoteCreatedDelivery({ quoteId: 'q1', payload: {} })), /Unique constraint/)
  await enqueueDelivery(c, quoteCreatedDelivery({ quoteId: 'q2', payload: {} }))
  assert.equal(c.rows.length, 2)
})

test('different event types for related entities do not collide', async () => {
  const c = uniqueClient()
  await enqueueDelivery(c, quoteCreatedDelivery({ quoteId: 'x', payload: {} }))
  await enqueueDelivery(c, orderConfirmedDelivery({ orderId: 'x', payload: {} }))
  assert.equal(c.rows.length, 2)
})

test('stores the env var name as target, never a URL', async () => {
  const c = uniqueClient()
  await enqueueDelivery(c, orderConfirmedDelivery({ orderId: 'o1', payload: { a: 1 } }))
  assert.equal(c.rows[0].target, 'N8N_LOGISTICS_WEBHOOK')
  assert.doesNotMatch(c.rows[0].target, /^https?:/)
})
