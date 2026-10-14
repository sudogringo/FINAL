import { test } from 'node:test'
import assert from 'node:assert/strict'
import { corsOrigin, parseAllowedOrigins } from './cors'

function check(fn: ReturnType<typeof corsOrigin>, origin: string | undefined) {
  let out: boolean | undefined
  fn(origin, (_e, allow) => { out = allow })
  return out
}

test('parses a comma-separated FRONTEND_URL, trimming spaces and trailing slashes', () => {
  assert.deepEqual(parseAllowedOrigins(' https://sudogringo.github.io/ , http://x.test '), ['https://sudogringo.github.io', 'http://x.test'])
  assert.deepEqual(parseAllowedOrigins(undefined), [])
  assert.deepEqual(parseAllowedOrigins(''), [])
})

test('allows listed origins and rejects others', () => {
  const fn = corsOrigin({ FRONTEND_URL: 'https://sudogringo.github.io,https://otro.test', NODE_ENV: 'production' })
  assert.equal(check(fn, 'https://sudogringo.github.io'), true)
  assert.equal(check(fn, 'https://otro.test'), true)
  assert.equal(check(fn, 'https://evil.test'), false)
})

test('localhost is allowed outside production only', () => {
  assert.equal(check(corsOrigin({}), 'http://localhost:5173'), true)
  assert.equal(check(corsOrigin({ NODE_ENV: 'production' }), 'http://localhost:5173'), false)
})

test('requests without Origin (curl, n8n, server to server) are allowed', () => {
  assert.equal(check(corsOrigin({ NODE_ENV: 'production' }), undefined), true)
})
