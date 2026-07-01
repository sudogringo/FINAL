import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductCard from '../features/products/components/ProductCard'
import { CartProvider } from '../features/cart/CartContext'
import type { Product } from '../data/products'

const MOCK_PRODUCT: Product = {
  id: 'test-product',
  name: 'Tomate de Prueba',
  line: 'roja',
  description: 'Descripción de prueba',
  sizes: ['250g', '1kg'],
  tag: 'Test',
}

function renderCard(product: Product = MOCK_PRODUCT) {
  return render(
    <CartProvider>
      <ProductCard product={product} />
    </CartProvider>
  )
}

describe('ProductCard', () => {
  it('renders product name and description', () => {
    renderCard()
    expect(screen.getByText('Tomate de Prueba')).toBeInTheDocument()
    expect(screen.getByText('Descripción de prueba')).toBeInTheDocument()
  })

  it('renders all size buttons', () => {
    renderCard()
    expect(screen.getByRole('button', { name: '250g' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1kg' })).toBeInTheDocument()
  })

  it('first size is selected by default', () => {
    renderCard()
    const btn = screen.getByRole('button', { name: '250g' })
    expect(btn).toHaveAttribute('aria-pressed', 'true')
  })

  it('changes selected size on click', () => {
    renderCard()
    fireEvent.click(screen.getByRole('button', { name: '1kg' }))
    expect(screen.getByRole('button', { name: '1kg' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '250g' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows "Agregar al Pedido" button', () => {
    renderCard()
    expect(screen.getByTestId('add-to-cart')).toBeInTheDocument()
  })

  it('qty cannot go below 1', () => {
    renderCard()
    const minus = screen.getByLabelText('Reducir cantidad')
    fireEvent.click(minus)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders correctly for Línea Dorada', () => {
    const golden: Product = { ...MOCK_PRODUCT, id: 'golden', name: 'Durazno Test', line: 'dorada' }
    renderCard(golden)
    expect(screen.getByText('Línea Dorada')).toBeInTheDocument()
  })
})
