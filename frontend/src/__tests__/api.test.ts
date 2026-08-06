import {
  submitQuote,
  adminLogin,
  fetchMonthlyStats,
  logInteraction,
  createProduct,
  deleteProduct,
} from '../features/admin/api'

const BASE = 'http://localhost:3001'

function mockFetchOnce(response: { ok: boolean; json?: () => Promise<unknown> }) {
  ;(global.fetch as jest.Mock).mockResolvedValueOnce(response)
}

describe('admin/api', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('submitQuote', () => {
    const payload = {
      sessionId: 'session-123',
      contact: { nombre: 'Juan', email: 'juan@example.com' },
      items: [{ id: 'p1', name: 'Tomate', line: 'roja', size: '1kg', qty: 2 }],
    }

    it('sends a POST to the correct URL with serialized body', async () => {
      mockFetchOnce({ ok: true, json: async () => ({ id: 'quote-1' }) })

      const result = await submitQuote(payload)

      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith(`${BASE}/api/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      expect(result).toEqual({ id: 'quote-1' })
    })

    it('throws when res.ok is false', async () => {
      mockFetchOnce({ ok: false, json: async () => ({}) })

      await expect(submitQuote(payload)).rejects.toThrow('Error al enviar cotización')
    })
  })

  describe('adminLogin', () => {
    it('returns the token from the response JSON on success', async () => {
      mockFetchOnce({ ok: true, json: async () => ({ token: 'jwt-token-abc' }) })

      const token = await adminLogin('admin@example.com', 'password123')

      expect(global.fetch).toHaveBeenCalledWith(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@example.com', password: 'password123' }),
      })
      expect(token).toBe('jwt-token-abc')
    })

    it('throws the expected Spanish error message when response is not ok', async () => {
      mockFetchOnce({ ok: false, json: async () => ({}) })

      await expect(adminLogin('admin@example.com', 'wrong')).rejects.toThrow('Credenciales incorrectas')
    })
  })

  describe('fetchMonthlyStats', () => {
    const token = 'jwt-token'

    it('builds the URL without the month query param when omitted', async () => {
      mockFetchOnce({ ok: true, json: async () => ({}) })

      await fetchMonthlyStats(token)

      expect(global.fetch).toHaveBeenCalledWith(`${BASE}/api/stats/monthly`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
    })

    it('builds the URL with the month query param when provided', async () => {
      mockFetchOnce({ ok: true, json: async () => ({}) })

      await fetchMonthlyStats(token, '2026-07')

      expect(global.fetch).toHaveBeenCalledWith(`${BASE}/api/stats/monthly?month=2026-07`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
    })
  })

  describe('logInteraction', () => {
    const payload = { sessionId: 'session-1', tipo: 'vista' as const }

    it('does not throw when fetch rejects (network failure)', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('network error'))

      await expect(logInteraction(payload)).resolves.toBeUndefined()
    })

    it('does not throw when fetch resolves with a non-ok response', async () => {
      mockFetchOnce({ ok: false, json: async () => ({}) })

      await expect(logInteraction(payload)).resolves.toBeUndefined()
    })

    it('calls fetch with the correct URL and body', async () => {
      mockFetchOnce({ ok: true, json: async () => ({}) })

      await logInteraction(payload)

      expect(global.fetch).toHaveBeenCalledWith(`${BASE}/api/interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    })
  })

  describe('createProduct', () => {
    const token = 'jwt-token'
    const productInput = {
      name: 'Tomate',
      line: 'roja' as const,
      description: 'Tomate fresco',
      sizes: ['1kg'],
    }

    it('happy path: calls fetch with the right method/URL and returns the created product', async () => {
      const createdProduct = { id: 'p1', ...productInput }
      mockFetchOnce({ ok: true, json: async () => createdProduct })

      const result = await createProduct(token, productInput)

      expect(global.fetch).toHaveBeenCalledWith(`${BASE}/api/products/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(productInput),
      })
      expect(result).toEqual(createdProduct)
    })

    it('throws the expected message when res.ok is false', async () => {
      mockFetchOnce({ ok: false, json: async () => ({}) })

      await expect(createProduct(token, productInput)).rejects.toThrow('Error al crear producto')
    })
  })

  describe('deleteProduct', () => {
    const token = 'jwt-token'

    it('happy path: calls fetch with the right method/URL', async () => {
      mockFetchOnce({ ok: true, json: async () => ({}) })

      await deleteProduct(token, 'p1')

      expect(global.fetch).toHaveBeenCalledWith(`${BASE}/api/products/admin/p1`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
    })

    it('throws the expected message when res.ok is false', async () => {
      mockFetchOnce({ ok: false, json: async () => ({}) })

      await expect(deleteProduct(token, 'p1')).rejects.toThrow('Error al eliminar producto')
    })
  })
})
