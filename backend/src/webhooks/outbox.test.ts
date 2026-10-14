import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  backoffMs, quoteCreatedDelivery, orderConfirmedDelivery, planAttempt, DEFAULT_CONFIG,
  parseStatusFilter, type DeliveryRecord,
} from './outbox'

const NOW = new Date('2026-10-14T12:00:00.000Z')

function rec(over: Partial<DeliveryRecord> = {}): DeliveryRecord {
  return {
    id: 'd1', eventType: 'quote.created', target: 'N8N_QUOTE_WEBHOOK', payload: {},
    idempotencyKey: 'quote:q1:created', status: 'PENDING', attempts: 0,
    nextAttemptAt: NOW, lastError: null, deliveredAt: null, createdAt: NOW, ...over,
  }
}

test('backoff doubles from 30 s and is capped at 1 h', () => {
  assert.equal(backoffMs(0), 30_000)
  assert.equal(backoffMs(1), 60_000)
  assert.equal(backoffMs(3), 240_000)
  assert.equal(backoffMs(7), 3_600_000)
  assert.equal(backoffMs(20), 3_600_000)
})

test('idempotency keys are derived from the event and the entity id', () => {
  const q = quoteCreatedDelivery({ quoteId: 'q1', payload: { a: 1 } })
  assert.equal(q.idempotencyKey, 'quote:q1:created')
  assert.equal(q.target, 'N8N_QUOTE_WEBHOOK')
  assert.equal(q.eventType, 'quote.created')
  const o = orderConfirmedDelivery({ orderId: 'o9', payload: {} })
  assert.equal(o.idempotencyKey, 'order:o9:confirmed')
  assert.equal(o.target, 'N8N_LOGISTICS_WEBHOOK')
  assert.notEqual(q.idempotencyKey, o.idempotencyKey)
})

test('success marks DELIVERED and counts the attempt', () => {
  const patch = planAttempt(rec(), { ok: true }, NOW)
  assert.equal(patch.status, 'DELIVERED')
  assert.equal(patch.attempts, 1)
  assert.deepEqual(patch.deliveredAt, NOW)
  assert.equal(patch.lastError, null)
})

test('failure keeps PENDING and schedules the next attempt with backoff', () => {
  const patch = planAttempt(rec({ attempts: 1 }), { ok: false, error: 'HTTP 500' }, NOW)
  assert.equal(patch.status, 'PENDING')
  assert.equal(patch.attempts, 2)
  assert.equal(patch.lastError, 'HTTP 500')
  assert.equal(patch.nextAttemptAt.getTime(), NOW.getTime() + 60_000)
})

test('failure on the last allowed attempt marks FAILED', () => {
  const patch = planAttempt(rec({ attempts: DEFAULT_CONFIG.maxAttempts - 1 }), { ok: false, error: 'boom' }, NOW)
  assert.equal(patch.status, 'FAILED')
  assert.equal(patch.attempts, DEFAULT_CONFIG.maxAttempts)
})

test('status filter accepts known statuses case-insensitively and rejects others', () => {
  assert.equal(parseStatusFilter(undefined), undefined)
  assert.equal(parseStatusFilter('failed'), 'FAILED')
  assert.equal(parseStatusFilter('SKIPPED'), 'SKIPPED')
  assert.equal(parseStatusFilter('nope'), null)
})
