/**
 * Bounded retry with exponential backoff, used to survive the cold start of the
 * free-tier backend (it sleeps after ~15 min and takes ~1 min to wake up).
 */

/** Time before telling the visitor the (free-tier) server is probably waking up. */
export const WAKING_AFTER_MS = 4000

export class HttpError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

export interface RetryOptions {
  /** Total time budget across all attempts and waits. */
  totalMs?: number
  /** Abort a single attempt that hangs longer than this. */
  attemptTimeoutMs?: number
  baseDelayMs?: number
  maxDelayMs?: number
  signal?: AbortSignal
  /** Called before waiting for the next attempt; `attempt` is the one that just failed (1-based). */
  onRetry?: (attempt: number, error: unknown) => void
}

function abortError(): DOMException {
  return new DOMException('Aborted', 'AbortError')
}

function isRetryable(error: unknown): boolean {
  if (error instanceof HttpError) return error.status >= 500
  return true
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError())
    const onAbort = () => { clearTimeout(timer); reject(abortError()) }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

export async function fetchWithRetry<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  {
    totalMs = 70_000,
    attemptTimeoutMs = 15_000,
    baseDelayMs = 1000,
    maxDelayMs = 8000,
    signal,
    onRetry,
  }: RetryOptions = {},
): Promise<T> {
  const deadline = Date.now() + totalMs
  for (let attempt = 1; ; attempt++) {
    if (signal?.aborted) throw abortError()

    const ctrl = new AbortController()
    const onCallerAbort = () => ctrl.abort()
    signal?.addEventListener('abort', onCallerAbort, { once: true })
    const timer = setTimeout(() => ctrl.abort(), attemptTimeoutMs)
    try {
      return await fn(ctrl.signal)
    } catch (error) {
      if (signal?.aborted) throw abortError()
      const delay = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs)
      if (!isRetryable(error) || Date.now() + delay >= deadline) throw error
      onRetry?.(attempt, error)
      await sleep(delay, signal)
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onCallerAbort)
    }
  }
}
