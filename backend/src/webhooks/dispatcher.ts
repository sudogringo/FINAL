import { DEFAULT_CONFIG, planAttempt, type DeliveryPatch, type DeliveryRecord } from './outbox'

export interface DeliveryStore {
  /** Reclama (con lease) las entregas PENDING vencidas, para que dos ciclos no envíen la misma. */
  claimDue(now: Date, limit: number, leaseMs: number): Promise<DeliveryRecord[]>
  save(id: string, patch: Partial<DeliveryPatch>): Promise<void>
}

export interface DispatcherDeps {
  store: DeliveryStore
  fetch: typeof fetch
  now: () => Date
  /** Resuelve el nombre de variable de entorno a la URL; undefined si no está configurada. */
  resolveUrl: (target: string) => string | undefined
  config?: typeof DEFAULT_CONFIG
}

const BATCH = 20

/** Un intento de envío: llama al webhook, guarda el nuevo estado y devuelve el cuerpo de n8n. */
export async function attemptDelivery(
  rec: DeliveryRecord,
  deps: DispatcherDeps,
): Promise<{ patch: Partial<DeliveryPatch>; body: unknown }> {
  const cfg = deps.config ?? DEFAULT_CONFIG
  const url = deps.resolveUrl(rec.target)
  if (!url) {
    const patch: Partial<DeliveryPatch> = { status: 'SKIPPED', lastError: `URL no configurada (${rec.target})` }
    await deps.store.save(rec.id, patch)
    return { patch, body: null }
  }

  let body: unknown = null
  let result: { ok: true } | { ok: false; error: string }
  try {
    const res = await deps.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': rec.idempotencyKey },
      body: JSON.stringify(rec.payload),
      signal: AbortSignal.timeout(cfg.timeoutMs),
    })
    if (res.ok) {
      result = { ok: true }
      body = await res.json().catch(() => null)
    } else {
      result = { ok: false, error: `HTTP ${res.status}` }
    }
  } catch (err) {
    result = { ok: false, error: String(err) }
  }

  const patch = planAttempt(rec, result, deps.now(), cfg)
  await deps.store.save(rec.id, patch)
  return { patch, body }
}

/** Un ciclo del worker: procesa las entregas vencidas. Devuelve cuántas tomó. */
export async function runDispatchCycle(deps: DispatcherDeps): Promise<number> {
  const cfg = deps.config ?? DEFAULT_CONFIG
  const due = await deps.store.claimDue(deps.now(), BATCH, cfg.leaseMs)
  for (const rec of due) {
    try {
      await attemptDelivery(rec, deps)
    } catch (err) {
      // El lease deja la entrega PENDING: se reintenta cuando venza.
      console.error(JSON.stringify({ event: 'webhook_dispatch_error', id: rec.id, error: String(err) }))
    }
  }
  return due.length
}

/** Worker en proceso: no solapa ciclos y no mantiene vivo el proceso. */
export function startDispatcher(deps: DispatcherDeps, intervalMs = 5_000): { stop: () => void } {
  let running = false
  const timer = setInterval(async () => {
    if (running) return
    running = true
    try { await runDispatchCycle(deps) }
    catch (err) { console.error(JSON.stringify({ event: 'webhook_dispatch_cycle_failed', error: String(err) })) }
    finally { running = false }
  }, intervalMs)
  timer.unref()
  return { stop: () => clearInterval(timer) }
}
