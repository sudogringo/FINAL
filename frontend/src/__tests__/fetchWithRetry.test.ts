import { fetchWithRetry, HttpError } from '../lib/fetchWithRetry'

describe('fetchWithRetry', () => {
  beforeEach(() => { jest.useFakeTimers() })
  afterEach(() => { jest.useRealTimers() })

  it('resolves immediately when the first attempt succeeds, without retrying', async () => {
    const fn = jest.fn().mockResolvedValue('ok')
    const onRetry = jest.fn()
    await expect(fetchWithRetry(fn, { onRetry })).resolves.toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
    expect(onRetry).not.toHaveBeenCalled()
  })

  it('retries after a network error with exponential backoff (1s, 2s, 4s)', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce('ok')
    const onRetry = jest.fn()
    const p = fetchWithRetry(fn, { onRetry })

    await jest.advanceTimersByTimeAsync(0)
    expect(fn).toHaveBeenCalledTimes(1)
    await jest.advanceTimersByTimeAsync(999)
    expect(fn).toHaveBeenCalledTimes(1)
    await jest.advanceTimersByTimeAsync(1)
    expect(fn).toHaveBeenCalledTimes(2)
    await jest.advanceTimersByTimeAsync(2000)
    expect(fn).toHaveBeenCalledTimes(3)
    await jest.advanceTimersByTimeAsync(4000)
    await expect(p).resolves.toBe('ok')
    expect(fn).toHaveBeenCalledTimes(4)
    expect(onRetry).toHaveBeenCalledTimes(3)
  })

  it('caps the delay at maxDelayMs', async () => {
    const fn = jest.fn().mockRejectedValue(new TypeError('down'))
    const p = fetchWithRetry(fn, { totalMs: 60_000, maxDelayMs: 8000 })
    p.catch(() => {})
    // delays: 1,2,4,8,8,8... -> after 1+2+4+8+8 = 23s there are 6 attempts
    await jest.advanceTimersByTimeAsync(23_000)
    expect(fn).toHaveBeenCalledTimes(6)
    await jest.advanceTimersByTimeAsync(60_000)
    await expect(p).rejects.toThrow('down')
  })

  it('gives up once the total time budget is spent and rethrows the last error', async () => {
    const fn = jest.fn().mockRejectedValue(new TypeError('still asleep'))
    const p = fetchWithRetry(fn, { totalMs: 10_000 })
    p.catch(() => {})
    await jest.advanceTimersByTimeAsync(10_000)
    await expect(p).rejects.toThrow('still asleep')
    const calls = fn.mock.calls.length
    await jest.advanceTimersByTimeAsync(60_000)
    expect(fn).toHaveBeenCalledTimes(calls)
  })

  it('retries on 5xx HttpError', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new HttpError(503, 'unavailable'))
      .mockResolvedValueOnce('ok')
    const p = fetchWithRetry(fn)
    await jest.advanceTimersByTimeAsync(1000)
    await expect(p).resolves.toBe('ok')
  })

  it('does NOT retry on 4xx HttpError', async () => {
    const fn = jest.fn().mockRejectedValue(new HttpError(404, 'nope'))
    await expect(fetchWithRetry(fn)).rejects.toMatchObject({ status: 404 })
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('aborts a hanging attempt after attemptTimeoutMs and retries', async () => {
    const fn = jest.fn()
      .mockImplementationOnce((signal: AbortSignal) => new Promise((_, reject) => {
        signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')))
      }))
      .mockResolvedValueOnce('ok')
    const p = fetchWithRetry(fn, { attemptTimeoutMs: 5000 })
    await jest.advanceTimersByTimeAsync(5000) // abort
    await jest.advanceTimersByTimeAsync(1000) // backoff
    await expect(p).resolves.toBe('ok')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('stops retrying and rejects when the caller aborts', async () => {
    const ctrl = new AbortController()
    const fn = jest.fn().mockRejectedValue(new TypeError('down'))
    const p = fetchWithRetry(fn, { signal: ctrl.signal })
    p.catch(() => {})
    await jest.advanceTimersByTimeAsync(0)
    ctrl.abort()
    await jest.advanceTimersByTimeAsync(10_000)
    await expect(p).rejects.toMatchObject({ name: 'AbortError' })
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
