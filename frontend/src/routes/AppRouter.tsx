import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import WhatsAppFab from '../components/layout/WhatsAppFab'
import ScrollToTop from '../components/layout/ScrollToTop'
import CartDrawer from '../features/cart/components/CartDrawer'
import QuoteForm from '../features/quote/components/QuoteForm'
import HomePage from '../pages/HomePage'
import CatalogoPage from '../pages/CatalogoPage'
import ContactoPage from '../pages/ContactoPage'
import AdminLoginPage from '../pages/admin/AdminLoginPage'
import AdminProductsPage from '../pages/admin/AdminProductsPage'
import AdminQuotesPage from '../pages/admin/AdminQuotesPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'

function RootLayout() {
  return (
    <>
      <ScrollToTop />
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
      { index: true,      element: <HomePage />     },
      { path: 'catalogo', element: <CatalogoPage /> },
      { path: 'contacto', element: <ContactoPage /> },
    ],
  },
  { path: '/admin/login',         element: <AdminLoginPage />     },
  { path: '/admin',               element: <AdminDashboardPage /> },
  { path: '/admin/cotizaciones',  element: <AdminQuotesPage />    },
  { path: '/admin/productos',     element: <AdminProductsPage />  },
], { basename: '/FINAL' })

export default function AppRouter() {
  return <RouterProvider router={router} />
}
