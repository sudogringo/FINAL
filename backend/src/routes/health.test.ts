import { test } from 'node:test'
import assert from 'node:assert/strict'
import { healthHandler } from './health'

function call(checkDb: () => Promise<void>, commit?: string) {
  const res = {
    statusCode: 200, body: undefined as unknown,
    status(c: number) { this.statusCode = c; return this },
    json(p: unknown) { this.body = p; return this },
  }
  return healthHandler(checkDb, commit)({} as any, res as any).then(() => res)
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

// The deployed commit lets anyone check which version Render serves (Render sets RENDER_GIT_COMMIT).
test('reports the deployed commit, shortened to seven characters', async () => {
  const res = await call(async () => {}, '040fc46df903865e6c02f17976bba22e9fcacfd4')
  assert.deepEqual(res.body, { status: 'ok', db: 'up', commit: '040fc46' })
})

test('reports the commit also when the database is down', async () => {
  const res = await call(async () => { throw new Error('no db') }, '85bc099aa')
  assert.equal(res.statusCode, 503)
  assert.deepEqual(res.body, { status: 'degraded', db: 'down', commit: '85bc099' })
})
