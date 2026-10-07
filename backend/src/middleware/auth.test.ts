import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import { requireAuthOrServiceKey } from './auth'

// Minimal Express doubles: only what the middleware touches.
function run(headers: Record<string, string>) {
  const req = { headers } as any
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) { this.statusCode = code; return this },
    json(payload: unknown) { this.body = payload; return this },
  }
  let nextCalled = false
  requireAuthOrServiceKey(req, res as any, () => { nextCalled = true })
  return { req, res, nextCalled }
}

beforeEach(() => {
  process.env.JWT_SECRET = 'test_jwt_secret'
  process.env.SERVICE_API_KEY = 'test_service_key'
})

test('rejects a request without credentials', () => {
  const { res, nextCalled } = run({})
  assert.equal(nextCalled, false)
  assert.equal(res.statusCode, 401)
})

test('accepts a valid admin JWT', () => {
  const token = jwt.sign({ adminId: 'admin-1' }, 'test_jwt_secret')
  const { req, nextCalled } = run({ authorization: `Bearer ${token}` })
  assert.equal(nextCalled, true)
  assert.equal(req.adminId, 'admin-1')
})

test('rejects a JWT signed with another secret', () => {
  const token = jwt.sign({ adminId: 'admin-1' }, 'other_secret')
  const { res, nextCalled } = run({ authorization: `Bearer ${token}` })
  assert.equal(nextCalled, false)
  assert.equal(res.statusCode, 401)
})

test('accepts the configured service key (n8n workflows)', () => {
  const { nextCalled } = run({ 'x-service-key': 'test_service_key' })
  assert.equal(nextCalled, true)
})

test('rejects a wrong service key', () => {
  const { res, nextCalled } = run({ 'x-service-key': 'guess' })
  assert.equal(nextCalled, false)
  assert.equal(res.statusCode, 401)
})

test('fails closed when SERVICE_API_KEY is not configured', () => {
  delete process.env.SERVICE_API_KEY
  const { res, nextCalled } = run({ 'x-service-key': '' })
  assert.equal(nextCalled, false)
  assert.equal(res.statusCode, 401)
})
