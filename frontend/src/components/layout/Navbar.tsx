import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, ShoppingCart } from 'lucide-react'
import { useCart } from '../../features/cart/CartContext'

const NAV_LINKS = [
  { label: 'Inicio',          to: '/' },
  { label: 'Catálogo',        to: '/catalogo' },
  { label: 'Contacto',        to: '/contacto' },
]

export default function Navbar() {
  const { totalItems, openCart } = useCart()
  const [scrolled, setScrolled]  = useState(false)
  const [menuOpen, setMenuOpen]  = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `text-[11px] font-heading font-bold tracking-[0.2em] uppercase transition-colors duration-300 ${
      isActive ? 'text-gold' : 'text-white/70 hover:text-white'
    }`

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-dark transition-shadow duration-500 ${
        scrolled ? 'shadow-lg shadow-black/20' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex flex-col leading-none group">
            <span className="text-[10px] font-heading font-semibold tracking-[0.35em] text-gold uppercase">
              Golden Harvest
            </span>
            <span className="text-2xl font-heading font-bold text-white tracking-widest group-hover:text-gold transition-colors duration-300">
              SILVIA
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Navegación principal">
            {NAV_LINKS.map(l => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkCls}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Cart + mobile toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={openCart}
              aria-label={`Ver pedido${totalItems > 0 ? ` (${totalItems} items)` : ''}`}
              className="relative flex items-center gap-2 bg-gold hover:bg-gold-dark text-dark font-heading font-bold text-[11px] px-4 py-2.5 rounded-full transition-all duration-300 shadow-lg shadow-gold/20 hover:shadow-gold/40 hover:scale-[1.03]"
            >
              <ShoppingCart size={15} />
              <span className="hidden sm:inline">Mi Pedido</span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#C0392B] text-white text-[9px] font-heading font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              className="lg:hidden text-white/60 hover:text-white p-2 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menú"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-400 ${
          menuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="bg-[#1B1B1B]/98 backdrop-blur-md border-t border-gold/10 px-6 py-5 flex flex-col gap-4">
          {NAV_LINKS.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={linkCls}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
