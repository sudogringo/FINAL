import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import WhatsAppFab from '../components/layout/WhatsAppFab'
import CartDrawer from '../features/cart/components/CartDrawer'
import QuoteForm from '../features/quote/components/QuoteForm'
import HomePage from '../pages/HomePage'
import CatalogoPage from '../pages/CatalogoPage'
import ContactoPage from '../pages/ContactoPage'

function RootLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <WhatsAppFab />
      <CartDrawer />
      <QuoteForm />
    </>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true,       element: <HomePage />     },
      { path: 'catalogo',  element: <CatalogoPage /> },
      { path: 'contacto',  element: <ContactoPage /> },
    ],
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
