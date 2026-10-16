import { useCallback, useEffect, useRef, useState } from 'react'
import { API_URL } from '../../config'
import { fetchProducts, type ApiProduct } from '../admin/api'
import { fetchWithRetry, WAKING_AFTER_MS } from '../../lib/fetchWithRetry'

export type ProductsStatus = 'loading' | 'waking' | 'ready' | 'unavailable'

export function useProducts() {
  const configured = API_URL !== ''
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [status, setStatus] = useState<ProductsStatus>(configured ? 'loading' : 'unavailable')
  const [attempt, setAttempt] = useState(0)
  const first = useRef(true)

  useEffect(() => {
    if (!configured) return
    const ctrl = new AbortController()
    // A retry (attempt > 0) flips back to loading; the first run already starts there.
    if (!first.current) setStatus('loading') // eslint-disable-line react-hooks/set-state-in-effect
    first.current = false
    const wakingTimer = setTimeout(() => setStatus(s => (s === 'loading' ? 'waking' : s)), WAKING_AFTER_MS)

    fetchWithRetry(signal => fetchProducts(signal), { signal: ctrl.signal })
      .then(data => { setProducts(data); setStatus('ready') })
      .catch(() => { if (!ctrl.signal.aborted) setStatus('unavailable') })
      .finally(() => clearTimeout(wakingTimer))

    return () => { ctrl.abort(); clearTimeout(wakingTimer) }
  }, [configured, attempt])

  const retry = useCallback(() => setAttempt(a => a + 1), [])
  return { products, status, retry, canRetry: configured }
}
