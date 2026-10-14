import { test } from 'node:test'
import assert from 'node:assert/strict'
import { listDeliveriesHandler } from './webhookDeliveries'

function call(status: unknown, list: (s: any) => Promise<unknown[]>) {
  const res = {
    statusCode: 200, body: undefined as unknown,
    status(c: number) { this.statusCode = c; return this },
    json(p: unknown) { this.body = p; return this },
  }
  return listDeliveriesHandler(list)({ query: { status } } as any, res as any).then(() => res)
}

test('lists deliveries filtered by a valid status', async () => {
  let seen: unknown = 'unset'
  const res = await call('failed', async s => { seen = s; return [{ id: 'd1' }] })
  assert.equal(seen, 'FAILED')
  assert.deepEqual(res.body, [{ id: 'd1' }])
})

test('no status means no filter', async () => {
  let seen: unknown = 'unset'
  await call(undefined, async s => { seen = s; return [] })
  assert.equal(seen, undefined)
})

test('rejects an unknown status with 400', async () => {
  const res = await call('bogus', async () => [])
  assert.equal(res.statusCode, 400)
})
