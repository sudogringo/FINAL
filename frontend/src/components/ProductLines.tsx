import { ArrowRight, ChevronRight } from 'lucide-react'

const redProducts = ['Tomate Entero Pelado', 'Cubetti di Pomodoro', 'Salsa Clásica', 'Doble Concentrado']
const goldenProducts = ['Mitades en Almíbar', 'Trozos en Almíbar', 'Durazno Light', 'Durazno al Natural']

export default function ProductLines() {
  return (
    <section id="productos" className="py-28 bg-[#1B1B1B]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-20">
          <span
            className="inline-block text-[#CABC6B] text-xs font-semibold tracking-[0.35em] uppercase mb-4"
            style={{ fontFamily: 'Quicksand, sans-serif' }}
          >
            Lo que ofrecemos
          </span>
          <h2
            className="text-4xl lg:text-5xl font-bold text-white leading-tight"
            style={{ fontFamily: 'Quicksand, sans-serif' }}
          >
            Nuestras{' '}
            <span className="text-gradient-gold">Líneas Premium</span>
          </h2>
          <p
            className="mt-4 text-white/50 text-lg max-w-xl mx-auto"
            style={{ fontFamily: 'Source Sans 3, sans-serif' }}
          >
            Dos líneas diseñadas para satisfacer distintos paladares,
            con la misma calidad de siempre.
          </p>
        </div>

        {/* Cards */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* ── LÍNEA ROJA ── */}
          <div className="group relative rounded-3xl border border-[#C0392B]/30 bg-[#212121] overflow-hidden hover:shadow-2xl hover:shadow-[#C0392B]/10 hover:-translate-y-2 transition-all duration-500">
            {/* Top bar */}
            <div className="h-1 w-full bg-gradient-to-r from-[#C0392B]/60 to-[#C0392B]" />

            <div className="p-8 lg:p-10">
              {/* Tag */}
              <span
                className="inline-block text-[10px] font-bold tracking-[0.35em] uppercase px-3 py-1.5 rounded-full mb-6 text-[#C0392B] border border-[#C0392B]/40 bg-[#C0392B]/10"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                LÍNEA ROJA
              </span>

              {/* Visual block */}
              <div className="relative h-44 rounded-2xl bg-gradient-to-br from-[#C0392B]/20 to-[#C0392B]/5 border border-[#C0392B]/20 mb-8 overflow-hidden flex items-center justify-center">
                {/* Big number decorative */}
                <span
                  className="absolute text-[120px] font-black leading-none select-none text-[#C0392B]/10"
                  style={{ fontFamily: 'Quicksand, sans-serif' }}
                >
                  R
                </span>
                {/* Central icon */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-2xl bg-[#C0392B]/20 border border-[#C0392B]/40 flex items-center justify-center text-3xl">
                    🍅
                  </div>
                  <span className="text-[#C0392B]/80 text-xs font-semibold tracking-widest uppercase"
                    style={{ fontFamily: 'Quicksand, sans-serif' }}>
                    Conservas de Tomate
                  </span>
                </div>
                {/* Decorative circles */}
                <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-[#C0392B]/15" />
                <div className="absolute -top-4 -left-4 w-14 h-14 rounded-full bg-[#C0392B]/10" />
              </div>

              {/* Info */}
              <h3
                className="text-3xl font-bold text-white mb-3"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                Línea Roja
              </h3>
              <p
                className="text-white/60 text-base leading-relaxed mb-8"
                style={{ fontFamily: 'Source Sans 3, sans-serif' }}
              >
                Tomates seleccionados en su punto justo de maduración, procesados y conservados
                para preservar todo su sabor y nutrientes. La base perfecta para tus recetas.
              </p>

              {/* Products */}
              <div className="grid grid-cols-2 gap-2 mb-8">
                {redProducts.map((product) => (
                  <div key={product} className="flex items-center gap-2">
                    <ChevronRight size={12} className="text-[#C0392B] shrink-0" />
                    <span className="text-white/70 text-sm" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                      {product}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button className="flex items-center gap-2 text-[#C0392B] border border-[#C0392B]/40 bg-[#C0392B]/10 hover:bg-[#C0392B] hover:text-white font-bold text-sm px-6 py-3 rounded-full transition-all duration-300"
                style={{ fontFamily: 'Quicksand, sans-serif' }}>
                Ver Productos
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* ── LÍNEA DORADA ── */}
          <div className="group relative rounded-3xl border border-[#CABC6B]/30 bg-[#212121] overflow-hidden hover:shadow-2xl hover:shadow-[#CABC6B]/10 hover:-translate-y-2 transition-all duration-500">
            {/* Top bar */}
            <div className="h-1 w-full bg-gradient-to-r from-[#CABC6B]/60 to-[#CABC6B]" />

            <div className="p-8 lg:p-10">
              {/* Tag */}
              <span
                className="inline-block text-[10px] font-bold tracking-[0.35em] uppercase px-3 py-1.5 rounded-full mb-6 text-[#CABC6B] border border-[#CABC6B]/40 bg-[#CABC6B]/10"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                LÍNEA DORADA
              </span>

              {/* Visual block */}
              <div className="relative h-44 rounded-2xl bg-gradient-to-br from-[#CABC6B]/20 to-[#CABC6B]/5 border border-[#CABC6B]/20 mb-8 overflow-hidden flex items-center justify-center">
                {/* Big letter decorative */}
                <span
                  className="absolute text-[120px] font-black leading-none select-none text-[#CABC6B]/10"
                  style={{ fontFamily: 'Quicksand, sans-serif' }}
                >
                  D
                </span>
                {/* Central icon */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-2xl bg-[#CABC6B]/20 border border-[#CABC6B]/40 flex items-center justify-center text-3xl">
                    🍑
                  </div>
                  <span className="text-[#CABC6B]/80 text-xs font-semibold tracking-widest uppercase"
                    style={{ fontFamily: 'Quicksand, sans-serif' }}>
                    Conservas de Durazno
                  </span>
                </div>
                {/* Decorative circles */}
                <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-[#CABC6B]/15" />
                <div className="absolute -top-4 -left-4 w-14 h-14 rounded-full bg-[#CABC6B]/10" />
              </div>

              {/* Info */}
              <h3
                className="text-3xl font-bold text-white mb-3"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                Línea Dorada
              </h3>
              <p
                className="text-white/60 text-base leading-relaxed mb-8"
                style={{ fontFamily: 'Source Sans 3, sans-serif' }}
              >
                Duraznos de cosecha propia en almíbar natural, con la dulzura y textura que los
                distingue. Un clásico de la mesa argentina elevado a su máxima expresión.
              </p>

              {/* Products */}
              <div className="grid grid-cols-2 gap-2 mb-8">
                {goldenProducts.map((product) => (
                  <div key={product} className="flex items-center gap-2">
                    <ChevronRight size={12} className="text-[#CABC6B] shrink-0" />
                    <span className="text-white/70 text-sm" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                      {product}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button className="flex items-center gap-2 text-[#CABC6B] border border-[#CABC6B]/40 bg-[#CABC6B]/10 hover:bg-[#CABC6B] hover:text-[#1B1B1B] font-bold text-sm px-6 py-3 rounded-full transition-all duration-300"
                style={{ fontFamily: 'Quicksand, sans-serif' }}>
                Ver Productos
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
