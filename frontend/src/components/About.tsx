import { Sprout, Factory, Stamp } from 'lucide-react'

const steps = [
  {
    icon: Sprout,
    title: 'Cultivo Propio',
    description:
      'Tomates y duraznos cultivados en nuestros campos bajo estrictos estándares de calidad, desde la semilla hasta la cosecha.',
  },
  {
    icon: Factory,
    title: 'Procesado Artesanal',
    description:
      'Cada fruta pasa por un proceso de selección manual y conservación que preserva el sabor natural sin aditivos innecesarios.',
  },
  {
    icon: Stamp,
    title: 'Certificación',
    description:
      'Cumplimos con todas las normativas nacionales de calidad alimentaria. Nuestros productos están certificados y auditados regularmente.',
  },
]

export default function About() {
  return (
    <section id="nosotros" className="py-28 bg-[#FBFBFB]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left: Text */}
          <div>
            <span
              className="inline-block text-[#CABC6B] text-xs font-semibold tracking-[0.35em] uppercase mb-4"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              Nuestra Historia
            </span>
            <h2
              className="text-4xl lg:text-5xl font-bold text-[#1B1B1B] leading-tight mb-6"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              Más de dos décadas{' '}
              <span style={{ color: '#CABC6B' }}>cosechando</span>{' '}
              calidad.
            </h2>
            <p
              className="text-[#1B1B1B]/60 text-lg leading-relaxed mb-6"
              style={{ fontFamily: 'Source Sans 3, sans-serif' }}
            >
              Golden Harvest S.A. nació con una convicción simple: llevar al
              consumidor el sabor auténtico del campo argentino, preservado con
              el método correcto y sin atajos. La marca{' '}
              <strong className="text-[#1B1B1B]">SILVIA</strong> representa
              esa filosofía en cada lata.
            </p>
            <p
              className="text-[#1B1B1B]/60 text-lg leading-relaxed mb-10"
              style={{ fontFamily: 'Source Sans 3, sans-serif' }}
            >
              Hoy digitalizamos nuestra operación para acercarnos más a
              quienes valoran lo genuino — con un catálogo moderno, atención
              personalizada y despacho ágil.
            </p>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-[#CABC6B] to-transparent w-24 mb-10" />

            {/* Numbers */}
            <div className="flex gap-12">
              {[
                { n: '+20', label: 'Años en el mercado' },
                { n: '2', label: 'Líneas Premium' },
                { n: '100%', label: 'Producción nacional' },
              ].map((s) => (
                <div key={s.label}>
                  <div
                    className="text-4xl font-bold text-[#CABC6B]"
                    style={{ fontFamily: 'Quicksand, sans-serif' }}
                  >
                    {s.n}
                  </div>
                  <div
                    className="text-[#1B1B1B]/50 text-xs uppercase tracking-wide mt-1"
                    style={{ fontFamily: 'Source Sans 3, sans-serif' }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Process steps */}
          <div className="flex flex-col gap-6">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="flex gap-5 p-6 rounded-2xl bg-white border border-[#1B1B1B]/8 hover:border-[#CABC6B]/40 hover:shadow-lg hover:shadow-[#CABC6B]/10 transition-all duration-300 group"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-[#CABC6B]/10 border border-[#CABC6B]/30 flex items-center justify-center group-hover:bg-[#CABC6B]/20 transition-colors duration-300">
                  <step.icon size={22} className="text-[#CABC6B]" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="text-[10px] font-bold text-[#CABC6B]/60 tracking-widest"
                      style={{ fontFamily: 'Quicksand, sans-serif' }}
                    >
                      0{i + 1}
                    </span>
                    <h3
                      className="text-[#1B1B1B] font-bold text-lg"
                      style={{ fontFamily: 'Quicksand, sans-serif' }}
                    >
                      {step.title}
                    </h3>
                  </div>
                  <p
                    className="text-[#1B1B1B]/60 text-sm leading-relaxed"
                    style={{ fontFamily: 'Source Sans 3, sans-serif' }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
