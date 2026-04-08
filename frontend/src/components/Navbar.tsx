import { useState, useEffect } from 'react'
import { Menu, X, ShoppingCart } from 'lucide-react'

const navLinks = [
  {
    label: 'Productos',
    href: '#productos',
    sub: ['Línea Roja', 'Línea Dorada', 'Recetas'],
  },
  { label: 'Producción', href: '#produccion' },
  { label: 'Certificaciones', href: '#certificaciones' },
  { label: 'Nosotros', href: '#nosotros' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#1B1B1B]/95 backdrop-blur-md shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#" className="flex flex-col leading-none group">
            <span
              className="text-[11px] font-semibold tracking-[0.3em] text-[#CABC6B] uppercase"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              Golden Harvest
            </span>
            <span
              className="text-2xl font-bold text-white tracking-widest group-hover:text-[#CABC6B] transition-colors duration-300"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              SILVIA
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.sub && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a
                  href={link.href}
                  className="text-sm font-semibold text-white/80 hover:text-[#CABC6B] tracking-wide transition-colors duration-300 uppercase"
                  style={{ fontFamily: 'Quicksand, sans-serif' }}
                >
                  {link.label}
                </a>
                {link.sub && activeDropdown === link.label && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3">
                    <div className="bg-[#212121] border border-[#CABC6B]/20 rounded-xl shadow-2xl overflow-hidden min-w-[160px]">
                      {link.sub.map((item) => (
                        <a
                          key={item}
                          href="#"
                          className="block px-5 py-3 text-sm text-white/70 hover:text-[#CABC6B] hover:bg-[#CABC6B]/10 transition-all duration-200"
                          style={{ fontFamily: 'Source Sans 3, sans-serif' }}
                        >
                          {item}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <button className="relative group flex items-center gap-2 bg-[#CABC6B] hover:bg-[#A89D4F] text-[#1B1B1B] font-bold text-sm px-5 py-2.5 rounded-full transition-all duration-300 shadow-lg shadow-[#CABC6B]/20 hover:shadow-[#CABC6B]/40 hover:scale-105"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              <ShoppingCart size={16} />
              Ver Catálogo
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ${
          menuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-[#1B1B1B]/98 backdrop-blur-md border-t border-[#CABC6B]/20 px-6 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <div key={link.label}>
              <a
                href={link.href}
                className="text-white font-semibold text-base tracking-wide hover:text-[#CABC6B] transition-colors"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
              {link.sub && (
                <div className="ml-4 mt-2 flex flex-col gap-2">
                  {link.sub.map((item) => (
                    <a
                      key={item}
                      href="#"
                      className="text-white/50 text-sm hover:text-[#CABC6B] transition-colors"
                    >
                      {item}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button className="mt-2 flex items-center justify-center gap-2 bg-[#CABC6B] text-[#1B1B1B] font-bold text-sm px-5 py-3 rounded-full"
            style={{ fontFamily: 'Quicksand, sans-serif' }}
          >
            <ShoppingCart size={16} />
            Ver Catálogo
          </button>
        </div>
      </div>
    </header>
  )
}
