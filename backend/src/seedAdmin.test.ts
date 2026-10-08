import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveAdminPassword } from './seedAdmin'

const generate = () => 'generated-random-password'

test('uses SEED_ADMIN_PASSWORD when it is long enough', () => {
  const r = resolveAdminPassword({ SEED_ADMIN_PASSWORD: 'a-long-enough-secret' }, generate)
  assert.deepEqual(r, { password: 'a-long-enough-secret', source: 'env' })
})

test('generates a random password when the variable is missing', () => {
  const r = resolveAdminPassword({}, generate)
  assert.deepEqual(r, { password: 'generated-random-password', source: 'generated' })
})

test('rejects a SEED_ADMIN_PASSWORD shorter than 12 characters', () => {
  assert.throws(() => resolveAdminPassword({ SEED_ADMIN_PASSWORD: 'admin1234' }, generate), /12/)
})

test('never falls back to the old hardcoded default', () => {
  const r = resolveAdminPassword({ SEED_ADMIN_PASSWORD: '' }, generate)
  assert.notEqual(r.password, 'admin1234')
  assert.equal(r.source, 'generated')
})
