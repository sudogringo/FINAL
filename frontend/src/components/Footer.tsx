export default function Footer() {
  return (
    <footer className="bg-[#111111] border-t border-white/5 py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start">
          <span
            className="text-[10px] text-[#CABC6B]/60 tracking-[0.4em] uppercase"
            style={{ fontFamily: 'Quicksand, sans-serif' }}
          >
            Golden Harvest S.A.
          </span>
          <span
            className="text-white/30 text-xs mt-0.5"
            style={{ fontFamily: 'Source Sans 3, sans-serif' }}
          >
            © {new Date().getFullYear()} — Todos los derechos reservados
          </span>
        </div>

        <div className="flex gap-6">
          {['Productos', 'Producción', 'Certificaciones', 'Contacto'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-white/30 hover:text-[#CABC6B] text-xs tracking-wide transition-colors duration-200 uppercase"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
