import { test } from 'node:test'
import assert from 'node:assert/strict'
import { healthHandler } from './health'

function call(checkDb: () => Promise<void>) {
  const res = {
    statusCode: 200, body: undefined as unknown,
    status(c: number) { this.statusCode = c; return this },
    json(p: unknown) { this.body = p; return this },
  }
  return healthHandler(checkDb)({} as any, res as any).then(() => res)
}

test('reports ok/up when the database answers', async () => {
  const res = await call(async () => {})
  assert.equal(res.statusCode, 200)
  assert.deepEqual(res.body, { status: 'ok', db: 'up' })
})

test('reports 503 degraded/down when the database fails', async () => {
  const res = await call(async () => { throw new Error('no db') })
  assert.equal(res.statusCode, 503)
  assert.deepEqual(res.body, { status: 'degraded', db: 'down' })
})
