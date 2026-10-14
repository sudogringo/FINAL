import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import CatalogoPage from '../pages/CatalogoPage'
import { CartProvider } from '../features/cart/CartContext'

jest.mock('../features/admin/api', () => ({
  logInteraction: jest.fn(),
  fetchProducts: jest.fn().mockResolvedValue([
    { id: 'a', name: 'Tomate A', line: 'roja', description: 'd', sizes: ['1kg'], tag: 't', stockBySize: { '1kg': 5 }, imageUrl: null },
    { id: 'b', name: 'Durazno B', line: 'dorada', description: 'd', sizes: ['1kg'], tag: 't', stockBySize: { '1kg': 5 }, imageUrl: null },
  ]),
}))

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) }) as unknown as typeof fetch
})

describe('CatalogoPage heading hierarchy', () => {
  it('has one h1 and product cards are h2 (no skipped level)', async () => {
    render(<CartProvider><CatalogoPage /></CartProvider>)
    await screen.findByText('Tomate A')
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0)
    const h2 = screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent)
    expect(h2).toEqual(['Tomate A', 'Durazno B'])
  })
})
