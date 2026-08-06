import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import CartDrawer from '../features/cart/components/CartDrawer'
import { CartProvider, useCart } from '../features/cart/CartContext'
import { act } from 'react'

function DrawerWithItem() {
  const { addItem, openCart } = useCart()
  return (
    <>
      <button onClick={() => { addItem({ id: 'p1', name: 'Tomate Entero', line: 'roja', size: '1kg' }); openCart() }}>
        Agregar item
      </button>
      <CartDrawer />
    </>
  )
}

function renderDrawer() {
  return render(
    <CartProvider>
      <DrawerWithItem />
    </CartProvider>
  )
}

describe('CartDrawer', () => {
  it('drawer is hidden initially', () => {
    renderDrawer()
    const drawer = screen.getByRole('complementary', { name: 'Carrito de pedido' })
    expect(drawer).toHaveClass('translate-x-full')
  })

  it('shows item after adding and opening the drawer', () => {
    renderDrawer()
    act(() => { fireEvent.click(screen.getByText('Agregar item')) })
    const drawer = screen.getByRole('complementary', { name: 'Carrito de pedido' })
    expect(drawer).not.toHaveClass('translate-x-full')
    expect(screen.getByText('Tomate Entero')).toBeInTheDocument()
  })

  it('displays item size and quantity', () => {
    renderDrawer()
    act(() => { fireEvent.click(screen.getByText('Agregar item')) })
    expect(screen.getByText('1kg')).toBeInTheDocument()
    // qty span has specific class — use getAllByText and check there's at least one
    const ones = screen.getAllByText('1')
    expect(ones.length).toBeGreaterThanOrEqual(1)
  })

  it('shows empty state message when cart is empty', () => {
    render(<CartProvider><CartDrawer /></CartProvider>)
    const btn = screen.getByRole('button', { name: 'Cerrar carrito' })
    fireEvent.click(btn)
    expect(screen.getByText(/Tu pedido está vacío/)).toBeInTheDocument()
  })

  it('"Solicitar Cotización" button appears when items exist', () => {
    renderDrawer()
    act(() => { fireEvent.click(screen.getByText('Agregar item')) })
    expect(screen.getByText('Solicitar Cotización')).toBeInTheDocument()
  })
})
