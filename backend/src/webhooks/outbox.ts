// Outbox transaccional de webhooks hacia n8n: tipos y reglas puras (sin I/O).

export type DeliveryStatus = 'PENDING' | 'DELIVERED' | 'FAILED' | 'SKIPPED'
const STATUSES: DeliveryStatus[] = ['PENDING', 'DELIVERED', 'FAILED', 'SKIPPED']

export interface DeliveryRecord {
  id: string
  eventType: string
  /** Nombre de la variable de entorno que contiene la URL (nunca la URL). */
  target: string
  payload: unknown
  idempotencyKey: string
  status: DeliveryStatus
  attempts: number
  nextAttemptAt: Date
  lastError: string | null
  deliveredAt: Date | null
  createdAt: Date
}

export interface NewDelivery {
  eventType: string
  target: string
  payload: unknown
  idempotencyKey: string
}

export const DEFAULT_CONFIG = {
  baseDelayMs: 30_000,
  maxDelayMs: 3_600_000,
  maxAttempts: 8,
  timeoutMs: 10_000,
  leaseMs: 60_000,
}

/** Espera antes del próximo intento, dado cuántos intentos ya se hicieron. */
export function backoffMs(attemptsDone: number, cfg = DEFAULT_CONFIG): number {
  return Math.min(cfg.baseDelayMs * 2 ** attemptsDone, cfg.maxDelayMs)
}

export function quoteCreatedDelivery({ quoteId, payload }: { quoteId: string; payload: unknown }): NewDelivery {
  return { eventType: 'quote.created', target: 'N8N_QUOTE_WEBHOOK', payload, idempotencyKey: `quote:${quoteId}:created` }
}

export function orderConfirmedDelivery({ orderId, payload }: { orderId: string; payload: unknown }): NewDelivery {
  return { eventType: 'order.confirmed', target: 'N8N_LOGISTICS_WEBHOOK', payload, idempotencyKey: `order:${orderId}:confirmed` }
}

export type AttemptResult = { ok: true } | { ok: false; error: string }

export interface DeliveryPatch {
  status: DeliveryStatus
  attempts: number
  nextAttemptAt: Date
  lastError: string | null
  deliveredAt: Date | null
}

/** Transición de estado tras un intento de envío. */
export function planAttempt(rec: DeliveryRecord, result: AttemptResult, now: Date, cfg = DEFAULT_CONFIG): DeliveryPatch {
  const attempts = rec.attempts + 1
  if (result.ok) {
    return { status: 'DELIVERED', attempts, nextAttemptAt: rec.nextAttemptAt, lastError: null, deliveredAt: now }
  }
  const exhausted = attempts >= cfg.maxAttempts
  return {
    status: exhausted ? 'FAILED' : 'PENDING',
    attempts,
    nextAttemptAt: exhausted ? rec.nextAttemptAt : new Date(now.getTime() + backoffMs(rec.attempts, cfg)),
    lastError: result.error,
    deliveredAt: null,
  }
}

/** undefined = sin filtro; null = valor inválido. */
export function parseStatusFilter(raw: unknown): DeliveryStatus | undefined | null {
  if (raw === undefined || raw === '') return undefined
  const up = String(raw).toUpperCase() as DeliveryStatus
  return STATUSES.includes(up) ? up : null
}
