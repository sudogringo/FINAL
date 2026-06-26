import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from 'react'
import { N8N_ABANDONED_WEBHOOK } from '../../config'

export interface CartItem {
  id: string
  name: string
  line: 'roja' | 'dorada'
  size: string
  qty: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  quoteOpen: boolean
}

type Action =
  | { type: 'ADD';     item: Omit<CartItem, 'qty'> }
  | { type: 'REMOVE';  id: string; size: string }
  | { type: 'SET_QTY'; id: string; size: string; qty: number }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'OPEN_QUOTE' }
  | { type: 'CLOSE_QUOTE' }
  | { type: 'CLEAR' }

function reducer(state: CartState, action: Action): CartState {
  const key = (id: string, size: string) => `${id}__${size}`
  switch (action.type) {
    case 'ADD': {
      const k = key(action.item.id, action.item.size)
      const exists = state.items.find(i => key(i.id, i.size) === k)
      return {
        ...state,
        isOpen: true,
        items: exists
          ? state.items.map(i => key(i.id, i.size) === k ? { ...i, qty: i.qty + 1 } : i)
          : [...state.items, { ...action.item, qty: 1 }],
      }
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter(i => !(i.id === action.id && i.size === action.size)) }
    case 'SET_QTY':
      if (action.qty <= 0)
        return { ...state, items: state.items.filter(i => !(i.id === action.id && i.size === action.size)) }
      return { ...state, items: state.items.map(i => i.id === action.id && i.size === action.size ? { ...i, qty: action.qty } : i) }
    case 'OPEN_CART':   return { ...state, isOpen: true }
    case 'CLOSE_CART':  return { ...state, isOpen: false }
    case 'OPEN_QUOTE':  return { ...state, isOpen: false, quoteOpen: true }
    case 'CLOSE_QUOTE': return { ...state, quoteOpen: false }
    case 'CLEAR':       return { items: [], isOpen: false, quoteOpen: false }
    default:            return state
  }
}

interface CartContextValue {
  items: CartItem[]
  isOpen: boolean
  quoteOpen: boolean
  totalItems: number
  addItem:    (item: Omit<CartItem, 'qty'>) => void
  removeItem: (id: string, size: string) => void
  setQty:     (id: string, size: string, qty: number) => void
  openCart:   () => void
  closeCart:  () => void
  openQuote:  () => void
  closeQuote: () => void
  clearCart:  () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const ABANDONMENT_MS = 2 * 60 * 60 * 1000

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], isOpen: false, quoteOpen: false })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalItems = state.items.reduce((sum, i) => sum + i.qty, 0)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (state.items.length === 0) return
    timerRef.current = setTimeout(() => {
      if (!N8N_ABANDONED_WEBHOOK) return
      fetch(N8N_ABANDONED_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: state.items,
          sessionId: sessionStorage.getItem('gh_session_id'),
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {})
    }, ABANDONMENT_MS)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [state.items])

  const ctx: CartContextValue = {
    items: state.items, isOpen: state.isOpen, quoteOpen: state.quoteOpen, totalItems,
    addItem:    item          => dispatch({ type: 'ADD', item }),
    removeItem: (id, size)   => dispatch({ type: 'REMOVE', id, size }),
    setQty:     (id, size, qty) => dispatch({ type: 'SET_QTY', id, size, qty }),
    openCart:   () => dispatch({ type: 'OPEN_CART' }),
    closeCart:  () => dispatch({ type: 'CLOSE_CART' }),
    openQuote:  () => dispatch({ type: 'OPEN_QUOTE' }),
    closeQuote: () => dispatch({ type: 'CLOSE_QUOTE' }),
    clearCart:  () => dispatch({ type: 'CLEAR' }),
  }

  return <CartContext.Provider value={ctx}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
