import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rateLimit } from './rateLimit'

function hit(mw: ReturnType<typeof rateLimit>, ip: string) {
  const headers: Record<string, string> = {}
  const res = {
    statusCode: 200, body: undefined as unknown,
    setHeader(k: string, v: string) { headers[k] = v },
    status(c: number) { this.statusCode = c; return this },
    json(p: unknown) { this.body = p; return this },
  }
  let passed = false
  mw({ ip } as any, res as any, () => { passed = true })
  return { passed, res, headers }
}

test('allows up to max requests per window and then answers 429 with Retry-After', () => {
  let t = 1_000_000
  const mw = rateLimit({ windowMs: 60_000, max: 3, now: () => t })
  assert.ok(hit(mw, '1.1.1.1').passed)
  assert.ok(hit(mw, '1.1.1.1').passed)
  assert.ok(hit(mw, '1.1.1.1').passed)
  const blocked = hit(mw, '1.1.1.1')
  assert.equal(blocked.passed, false)
  assert.equal(blocked.res.statusCode, 429)
  assert.equal(blocked.headers['Retry-After'], '60')
})

test('the counter is per client IP', () => {
  const mw = rateLimit({ windowMs: 60_000, max: 1, now: () => 0 })
  assert.ok(hit(mw, 'a').passed)
  assert.equal(hit(mw, 'a').passed, false)
  assert.ok(hit(mw, 'b').passed)
})

test('the window resets after windowMs', () => {
  let t = 0
  const mw = rateLimit({ windowMs: 1_000, max: 1, now: () => t })
  assert.ok(hit(mw, 'a').passed)
  assert.equal(hit(mw, 'a').passed, false)
  t = 1_001
  assert.ok(hit(mw, 'a').passed)
})

test('skip() bypasses the limiter', () => {
  const mw = rateLimit({ windowMs: 1_000, max: 1, now: () => 0, skip: () => true })
  assert.ok(hit(mw, 'a').passed)
  assert.ok(hit(mw, 'a').passed)
})
