import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import ProductList from '../features/products/components/ProductList'
import { CartProvider } from '../features/cart/CartContext'
import { fetchProducts } from '../features/admin/api'

jest.mock('../config', () => ({
  API_URL: '',
  N8N_QUOTE_WEBHOOK: '',
  N8N_ABANDONED_WEBHOOK: '',
}))
jest.mock('../features/admin/api', () => ({
  logInteraction: jest.fn(),
  fetchProducts: jest.fn(),
}))

describe('ProductList without a configured backend (VITE_API_URL unset in production)', () => {
  it('shows a clear "catálogo no disponible" state and never calls the API', () => {
    render(<CartProvider><ProductList /></CartProvider>)
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent(/cat[aá]logo no disponible/i)
    expect(fetchProducts).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: /reintentar/i })).not.toBeInTheDocument()
  })

  it('does not render the misleading "no se encontraron productos" empty search state', () => {
    render(<CartProvider><ProductList /></CartProvider>)
    expect(screen.queryByText(/no se encontraron productos/i)).not.toBeInTheDocument()
  })
})
