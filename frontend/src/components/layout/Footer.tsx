import { Link } from 'react-router-dom'

const LINKS = [
  { label: 'Inicio',   to: '/' },
  { label: 'Catálogo', to: '/catalogo' },
  { label: 'Contacto', to: '/contacto' },
]

export default function Footer() {
  return (
    <footer className="bg-[#111111] border-t border-white/5 py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start">
          <span className="text-[10px] text-gold/50 font-heading tracking-[0.4em] uppercase">Golden Harvest S.A.</span>
          <span className="text-white/70 text-[12px] font-body mt-0.5 text-center md:text-left">
            Proyecto académico (UTN FRM, {new Date().getFullYear()}). Sitio de demostración sin vínculo con Golden Harvest S.A.
          </span>
        </div>
        <nav className="flex gap-6" aria-label="Links del footer">
          {LINKS.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className="text-white/30 hover:text-gold text-[10px] font-heading font-bold tracking-[0.2em] uppercase transition-colors duration-200"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
