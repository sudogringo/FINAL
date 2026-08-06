import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductCard from '../features/products/components/ProductCard'
import { CartProvider } from '../features/cart/CartContext'
import type { Product } from '../data/products'

// ProductCard logs a "vista" interaction via fetch on mount; jsdom has no
// global fetch, so stub it to avoid unhandled rejections crashing the suite.
beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) }) as unknown as typeof fetch
})

const MOCK_PRODUCT: Product = {
  id: 'test-product',
  name: 'Tomate de Prueba',
  line: 'roja',
  description: 'Descripción de prueba',
  sizes: ['250g', '1kg'],
  tag: 'Test',
  stockBySize: { '250g': 10, '1kg': 10 },
  imageUrl: null,
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
    expect(screen.getByLabelText('Cantidad')).toHaveValue(1)
  })

  it('renders correctly for Línea Dorada', () => {
    const golden: Product = { ...MOCK_PRODUCT, id: 'golden', name: 'Durazno Test', line: 'dorada' }
    renderCard(golden)
    expect(screen.getByText('Línea Dorada')).toBeInTheDocument()
  })

  it('disables add-to-cart and shows "Sin stock" when selected size has 0 stock', () => {
    const outOfStock: Product = {
      ...MOCK_PRODUCT,
      id: 'out-of-stock',
      stockBySize: { '250g': 0, '1kg': 10 },
    }
    renderCard(outOfStock)
    // '250g' is the default selected size
    const addBtn = screen.getByTestId('add-to-cart')
    expect(addBtn).toBeDisabled()
    expect(addBtn).toHaveTextContent('Sin stock')
  })

  it('blocks qty increment past stock cap for the selected size', () => {
    const limited: Product = {
      ...MOCK_PRODUCT,
      id: 'limited-stock',
      stockBySize: { '250g': 2, '1kg': 10 },
    }
    renderCard(limited)
    const plus = screen.getByLabelText('Aumentar cantidad')
    fireEvent.click(plus)
    expect(screen.getByLabelText('Cantidad')).toHaveValue(2)
    // further clicks should not exceed the stock cap of 2
    fireEvent.click(plus)
    fireEvent.click(plus)
    expect(screen.getByLabelText('Cantidad')).toHaveValue(2)
    expect(plus).toBeDisabled()
  })

  it('does not disable qty controls or add-to-cart when the other size has 0 stock', () => {
    const outOfStock: Product = {
      ...MOCK_PRODUCT,
      id: 'out-of-stock-2',
      stockBySize: { '250g': 0, '1kg': 10 },
    }
    renderCard(outOfStock)
    fireEvent.click(screen.getByRole('button', { name: '1kg' }))
    expect(screen.getByTestId('add-to-cart')).not.toBeDisabled()
    expect(screen.getByLabelText('Aumentar cantidad')).not.toBeDisabled()
  })
})
