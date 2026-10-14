import '@testing-library/jest-dom'
import { render, screen, act, fireEvent } from '@testing-library/react'
import ProductList from '../features/products/components/ProductList'
import { CartProvider } from '../features/cart/CartContext'
import { fetchProducts } from '../features/admin/api'

jest.mock('../config', () => ({
  API_URL: 'https://api.example.test',
  N8N_QUOTE_WEBHOOK: '',
  N8N_ABANDONED_WEBHOOK: '',
}))
jest.mock('../features/admin/api', () => ({
  logInteraction: jest.fn(),
  fetchProducts: jest.fn(),
}))

const mockFetch = fetchProducts as jest.Mock
const PRODUCTS = [
  { id: 'a', name: 'Tomate A', line: 'roja', description: 'd', sizes: ['1kg'], tag: 't', stockBySize: { '1kg': 5 }, imageUrl: null },
]
const renderList = () => render(<CartProvider><ProductList /></CartProvider>)

describe('ProductList loading / cold start / failure states', () => {
  beforeEach(() => { jest.useFakeTimers(); mockFetch.mockReset() })
  afterEach(() => { jest.useRealTimers() })

  it('shows products with no status message when the API answers fast', async () => {
    mockFetch.mockResolvedValue(PRODUCTS)
    renderList()
    expect(await screen.findByText('Tomate A')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('announces "despertando el servidor" (aria-live) only after a few seconds of waiting', async () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    renderList()
    expect(screen.queryByText(/despertando el servidor/i)).not.toBeInTheDocument()
    await act(async () => { await jest.advanceTimersByTimeAsync(3000) })
    expect(screen.queryByText(/despertando el servidor/i)).not.toBeInTheDocument()
    await act(async () => { await jest.advanceTimersByTimeAsync(1500) })
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(/despertando el servidor/i)
    expect(status).toHaveAttribute('aria-live', 'polite')
  })

  it('recovers when the server wakes up after failed attempts', async () => {
    mockFetch
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(PRODUCTS)
    renderList()
    await act(async () => { await jest.advanceTimersByTimeAsync(3500) })
    expect(await screen.findByText('Tomate A')).toBeInTheDocument()
    expect(screen.queryByText(/despertando el servidor/i)).not.toBeInTheDocument()
    expect(mockFetch).toHaveBeenCalledTimes(3)
  })

  it('shows "catálogo no disponible" with a retry button once the ~70 s budget is spent, and retries on click', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'))
    renderList()
    await act(async () => { await jest.advanceTimersByTimeAsync(75_000) })
    expect(screen.getByRole('status')).toHaveTextContent(/cat[aá]logo no disponible/i)
    const calls = mockFetch.mock.calls.length
    expect(calls).toBeGreaterThan(5)

    mockFetch.mockResolvedValue(PRODUCTS)
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /reintentar/i })) })
    expect(await screen.findByText('Tomate A')).toBeInTheDocument()
    expect(mockFetch.mock.calls.length).toBe(calls + 1)
  })

  it('keeps the filter and search controls usable while loading (never blocks the page)', async () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    renderList()
    expect(screen.getByLabelText('Buscar producto')).toBeEnabled()
  })
})
