import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { act } from 'react'
import { CartProvider, useCart } from '../features/cart/CartContext'

jest.mock('../config', () => ({
  N8N_ABANDONED_WEBHOOK: 'http://test-webhook.local/abandoned',
}))

function Harness() {
  const {
    items, isOpen, quoteOpen, totalItems,
    addItem, removeItem, setQty,
    openCart, closeCart, openQuote, closeQuote, clearCart,
  } = useCart()

  return (
    <div>
      <div data-testid="isOpen">{String(isOpen)}</div>
      <div data-testid="quoteOpen">{String(quoteOpen)}</div>
      <div data-testid="totalItems">{totalItems}</div>
      <div data-testid="itemCount">{items.length}</div>
      <ul>
        {items.map(i => (
          <li key={`${i.id}__${i.size}`} data-testid={`item-${i.id}-${i.size}`}>
            {i.name} / {i.size} / qty:{i.qty} / stock:{i.stockForSize}
          </li>
        ))}
      </ul>

      <button onClick={() => addItem({ id: 'p1', name: 'Tomate Entero', line: 'roja', size: '1kg', stockForSize: 3 })}>
        add-p1-1kg
      </button>
      <button onClick={() => addItem({ id: 'p2', name: 'Miel Dorada', line: 'dorada', size: '500g', stockForSize: 10 })}>
        add-p2-500g
      </button>
      <button onClick={() => addItem({ id: 'p3', name: 'Sin Stock', line: 'roja', size: '2kg', stockForSize: 0 })}>
        add-p3-nostock
      </button>

      <button onClick={() => removeItem('p1', '1kg')}>remove-p1-1kg</button>

      <button onClick={() => setQty('p1', '1kg', 0)}>setqty-p1-0</button>
      <button onClick={() => setQty('p1', '1kg', 2)}>setqty-p1-2</button>
      <button onClick={() => setQty('p1', '1kg', 999)}>setqty-p1-999</button>

      <button onClick={openCart}>open-cart</button>
      <button onClick={closeCart}>close-cart</button>
      <button onClick={openQuote}>open-quote</button>
      <button onClick={closeQuote}>close-quote</button>
      <button onClick={clearCart}>clear-cart</button>
    </div>
  )
}

function renderHarness() {
  return render(
    <CartProvider>
      <Harness />
    </CartProvider>
  )
}

describe('CartContext', () => {
  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('addItem is blocked at the per-size stock cap', () => {
    renderHarness()
    const addP3 = screen.getByText('add-p3-nostock')
    // stockForSize 0 means uncapped per reducer logic (only caps when > 0 for existing items)
    // use a capped item instead: p1 has stockForSize 3
    const addP1 = screen.getByText('add-p1-1kg')
    act(() => { fireEvent.click(addP1) }) // qty 1
    act(() => { fireEvent.click(addP1) }) // qty 2
    act(() => { fireEvent.click(addP1) }) // qty 3 (== stock cap)
    act(() => { fireEvent.click(addP1) }) // blocked, still 3
    act(() => { fireEvent.click(addP1) }) // blocked, still 3
    expect(screen.getByTestId('item-p1-1kg')).toHaveTextContent('qty:3')
    expect(addP3).toBeInTheDocument() // sanity: button rendered
  })

  it('setQty(0) removes the item entirely', () => {
    renderHarness()
    act(() => { fireEvent.click(screen.getByText('add-p1-1kg')) })
    expect(screen.getByTestId('itemCount')).toHaveTextContent('1')
    act(() => { fireEvent.click(screen.getByText('setqty-p1-0')) })
    expect(screen.getByTestId('itemCount')).toHaveTextContent('0')
    expect(screen.queryByTestId('item-p1-1kg')).not.toBeInTheDocument()
  })

  it('setQty caps at the stock limit when set above it', () => {
    renderHarness()
    act(() => { fireEvent.click(screen.getByText('add-p1-1kg')) }) // stockForSize: 3
    act(() => { fireEvent.click(screen.getByText('setqty-p1-999')) })
    expect(screen.getByTestId('item-p1-1kg')).toHaveTextContent('qty:3')
  })

  it('setQty sets a valid in-range quantity normally', () => {
    renderHarness()
    act(() => { fireEvent.click(screen.getByText('add-p1-1kg')) })
    act(() => { fireEvent.click(screen.getByText('setqty-p1-2')) })
    expect(screen.getByTestId('item-p1-1kg')).toHaveTextContent('qty:2')
  })

  it('removeItem removes the specified item', () => {
    renderHarness()
    act(() => { fireEvent.click(screen.getByText('add-p1-1kg')) })
    act(() => { fireEvent.click(screen.getByText('add-p2-500g')) })
    expect(screen.getByTestId('itemCount')).toHaveTextContent('2')
    act(() => { fireEvent.click(screen.getByText('remove-p1-1kg')) })
    expect(screen.getByTestId('itemCount')).toHaveTextContent('1')
    expect(screen.queryByTestId('item-p1-1kg')).not.toBeInTheDocument()
    expect(screen.getByTestId('item-p2-500g')).toBeInTheDocument()
  })

  it('clearCart empties the cart and resets isOpen/quoteOpen', () => {
    renderHarness()
    act(() => { fireEvent.click(screen.getByText('add-p1-1kg')) })
    act(() => { fireEvent.click(screen.getByText('open-quote')) }) // isOpen:false, quoteOpen:true
    expect(screen.getByTestId('quoteOpen')).toHaveTextContent('true')
    act(() => { fireEvent.click(screen.getByText('clear-cart')) })
    expect(screen.getByTestId('itemCount')).toHaveTextContent('0')
    expect(screen.getByTestId('isOpen')).toHaveTextContent('false')
    expect(screen.getByTestId('quoteOpen')).toHaveTextContent('false')
  })

  it('totalItems sums quantities across multiple distinct items', () => {
    renderHarness()
    act(() => { fireEvent.click(screen.getByText('add-p1-1kg')) }) // qty 1
    act(() => { fireEvent.click(screen.getByText('add-p1-1kg')) }) // qty 2
    act(() => { fireEvent.click(screen.getByText('add-p2-500g')) }) // qty 1
    expect(screen.getByTestId('totalItems')).toHaveTextContent('3')
  })

  it('openCart/closeCart/openQuote/closeQuote toggle state directly', () => {
    renderHarness()
    expect(screen.getByTestId('isOpen')).toHaveTextContent('false')

    act(() => { fireEvent.click(screen.getByText('open-cart')) })
    expect(screen.getByTestId('isOpen')).toHaveTextContent('true')

    act(() => { fireEvent.click(screen.getByText('close-cart')) })
    expect(screen.getByTestId('isOpen')).toHaveTextContent('false')

    act(() => { fireEvent.click(screen.getByText('open-quote')) })
    expect(screen.getByTestId('quoteOpen')).toHaveTextContent('true')
    expect(screen.getByTestId('isOpen')).toHaveTextContent('false')

    act(() => { fireEvent.click(screen.getByText('close-quote')) })
    expect(screen.getByTestId('quoteOpen')).toHaveTextContent('false')
  })

  describe('abandoned cart webhook', () => {
    const ABANDONMENT_MS = 2 * 60 * 60 * 1000

    beforeEach(() => {
      jest.useFakeTimers()
      global.fetch = jest.fn().mockResolvedValue({ ok: true })
    })

    it('fires the webhook after the abandonment threshold when the cart has items', () => {
      sessionStorage.setItem('gh_session_id', 'sess-123')
      renderHarness()
      act(() => { fireEvent.click(screen.getByText('add-p1-1kg')) })

      act(() => { jest.advanceTimersByTime(ABANDONMENT_MS) })

      expect(global.fetch).toHaveBeenCalledTimes(1)
      const [url, options] = (global.fetch as jest.Mock).mock.calls[0]
      expect(url).toBe('http://test-webhook.local/abandoned')
      expect(options.method).toBe('POST')
      const body = JSON.parse(options.body)
      expect(body.items).toHaveLength(1)
      expect(body.items[0]).toMatchObject({ id: 'p1', size: '1kg', qty: 1 })
      expect(body.sessionId).toBe('sess-123')
      expect(typeof body.timestamp).toBe('string')
    })

    it('does not fire the webhook when the cart is empty', () => {
      renderHarness()
      act(() => { jest.advanceTimersByTime(ABANDONMENT_MS) })
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })
})
