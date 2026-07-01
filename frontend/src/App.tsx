import { CartProvider } from './features/cart/CartContext'
import { AdminProvider } from './features/admin/AdminContext'
import AppRouter from './routes/AppRouter'

if (!sessionStorage.getItem('gh_session_id')) {
  sessionStorage.setItem('gh_session_id', crypto.randomUUID())
}

export default function App() {
  return (
    <AdminProvider>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </AdminProvider>
  )
}
