import { CartProvider } from './features/cart/CartContext'
import AppRouter from './routes/AppRouter'

if (!sessionStorage.getItem('gh_session_id')) {
  sessionStorage.setItem('gh_session_id', crypto.randomUUID())
}

export default function App() {
  return (
    <CartProvider>
      <AppRouter />
    </CartProvider>
  )
}
