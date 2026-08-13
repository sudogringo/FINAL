import { Link } from 'react-router-dom'
import heroBanner from '../assets/hero-banner.jpg'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-dark">
      {/* Background collage — planta, línea de producción, envasado */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBanner})` }}
      />

      {/* Velo crema radial para levantar la lectura del contenido central */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 55% 62% at 50% 55%, rgba(251,251,251,0.68) 0%, rgba(251,251,251,0.32) 45%, transparent 72%)',
        }}
      />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-28 pb-14 text-center">
        {/* Óvalo — marca. El wrapper anima transform; el blur vive en un hijo estático
            (Chromium no recorta bien backdrop-filter en un elemento que además anima transform). */}
        <div className="animate-fade-in-up relative w-[92vw] max-w-[300px] sm:max-w-[520px] md:max-w-[640px] aspect-square sm:aspect-[3/2]">
          <div className="w-full h-full rounded-[3rem] sm:rounded-[50%] overflow-hidden bg-cream/95 backdrop-blur-lg border border-gold/40 shadow-2xl shadow-black/20 flex flex-col items-center justify-center px-8 sm:px-14">
            <span className="text-dark/45 text-[9px] sm:text-xs font-heading font-semibold tracking-[0.3em] uppercase">
              Marca Registrada · Mendoza
            </span>

            <h1 className="text-gold font-heading font-bold text-6xl sm:text-7xl md:text-8xl tracking-[0.12em] mt-3 leading-none">
              SILVIA
            </h1>

            <div className="flex items-center gap-3 my-4">
              <span className="h-px w-10 sm:w-16 bg-gold/50" />
              <span className="flex items-center gap-2">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 rotate-45 bg-gold/60" />
                ))}
              </span>
              <span className="h-px w-10 sm:w-16 bg-gold/50" />
            </div>

            <p className="font-body italic text-dark/80 text-lg sm:text-2xl">
              La tradición del campo, en tu mesa.
            </p>

            <span className="text-dark/40 text-[9px] sm:text-xs font-heading font-semibold tracking-[0.25em] uppercase mt-3">
              Conservas de Tomate &amp; Durazno
            </span>
          </div>
        </div>

        {/* CTAs */}
        <div className="animate-fade-in-up delay-200 relative z-20 flex flex-wrap items-center justify-center gap-4 mt-8 sm:mt-10">
          <Link
            to="/catalogo"
            className="bg-gold hover:bg-gold-dark text-dark font-heading font-bold px-8 py-4 rounded-full shadow-xl shadow-black/15 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
          >
            Explorar el Catálogo
          </Link>
          <a
            href="#nosotros"
            className="bg-cream/95 hover:bg-cream border border-gold/40 hover:border-gold/60 text-dark/75 hover:text-dark font-heading font-semibold px-8 py-4 rounded-full backdrop-blur-lg transition-all duration-300 text-sm sm:text-base"
          >
            Nuestra Historia
          </a>
        </div>

        {/* Certificaciones — pill con fondo propio, no depende de qué haya detrás en la foto */}
        <div className="animate-fade-in delay-400 mt-8 bg-dark/55 backdrop-blur-md rounded-full px-6 py-2.5 text-cream/90 text-[10px] sm:text-xs font-heading font-semibold tracking-[0.25em] uppercase">
          FSSC 22000 · PAS · Kosher · Trazabilidad por Lote
        </div>
      </div>
    </section>
  )
}
