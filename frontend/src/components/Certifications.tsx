import { ShieldCheck, Star, Users } from 'lucide-react'

const certs = [
  {
    icon: ShieldCheck,
    name: 'FSSC 22000',
    tag: 'Certificación Internacional',
    tagColor: '#CABC6B',
    description:
      'Contamos con una larga trayectoria en sistemas de gestión certificados. Comenzamos implementando normas nacionales IRAM, lo que marcó un primer paso fundamental en la estandarización y control de nuestros procesos. Con el tiempo, en línea con las exigencias internacionales del sector alimentario, evolucionamos hacia los estándares más amplios y exigentes, adoptando actualmente la certificación FSSC 22000.',
  },
  {
    icon: Star,
    name: 'PAS',
    tag: 'Prerrequisitos y Saneamiento',
    tagColor: '#A89D4F',
    description:
      'Nuestra planta cuenta con rigurosos sistemas de limpieza, control de plagas y mejora continua en mantenimiento e instalaciones. Estas prácticas son fundamentales para garantizar la inocuidad de los productos y el cumplimiento con diferentes normas y sistemas de gestión de calidad.',
  },
  {
    icon: Users,
    name: 'Kosher',
    tag: 'Certificación Religiosa',
    tagColor: '#C0392B',
    description:
      'Nuestros productos cuentan con certificación Kosher, emitida por autoridades rabínicas que auditan ingredientes, procesos y trazabilidad. Esta certificación garantiza que nuestros productos siguen estándares de proceso específicos y se cumple la normativa Kosher para poder ser distribuidos en diferentes mercados.',
  },
]

export default function Certifications() {
  return (
    <section id="certificaciones" className="py-28 bg-[#1B1B1B]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <span
              className="inline-block text-[#CABC6B] text-xs font-semibold tracking-[0.35em] uppercase mb-4"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              Respaldo oficial
            </span>
            <h2
              className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              La calidad no es
              <br />
              un diferencial,
              <br />
              <span className="text-gradient-gold">es un estándar.</span>
            </h2>
            <p
              className="text-white/60 text-lg leading-relaxed"
              style={{ fontFamily: 'Source Sans 3, sans-serif' }}
            >
              Cada producto que sale de nuestra planta está respaldado por
              rigurosos controles y sistemas de gestión de calidad e inocuidad
              certificados.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: 'FSSC', sub: '22000', label: 'Certificación principal' },
              { value: '3', sub: '+', label: 'Certificaciones activas' },
              { value: 'IRAM', sub: '→', label: 'Origen del proceso' },
              { value: '100%', sub: '', label: 'Trazabilidad por lote' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-[#212121] border border-white/8 p-6 text-center"
              >
                <div
                  className="text-3xl font-bold text-[#CABC6B] leading-none"
                  style={{ fontFamily: 'Quicksand, sans-serif' }}
                >
                  {s.value}<span className="text-xl">{s.sub}</span>
                </div>
                <div
                  className="text-white/40 text-xs uppercase tracking-wide mt-2"
                  style={{ fontFamily: 'Source Sans 3, sans-serif' }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cert cards */}
        <div className="flex flex-col gap-6">
          {certs.map((cert) => (
            <div
              key={cert.name}
              className="group relative rounded-3xl bg-[#212121] border border-white/8 p-8 hover:border-[#CABC6B]/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30 transition-all duration-300"
            >
              {/* Top accent */}
              <div
                className="absolute top-0 left-10 right-10 h-px rounded-full"
                style={{ background: `linear-gradient(90deg, transparent, ${cert.tagColor}50, transparent)` }}
              />

              <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
                {/* Icon + name */}
                <div className="flex items-center gap-4 lg:w-56 shrink-0">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: `${cert.tagColor}15`, border: `1px solid ${cert.tagColor}30` }}
                  >
                    <cert.icon size={26} style={{ color: cert.tagColor }} />
                  </div>
                  <div>
                    <h3
                      className="text-white font-bold text-xl leading-none mb-1.5"
                      style={{ fontFamily: 'Quicksand, sans-serif' }}
                    >
                      {cert.name}
                    </h3>
                    <span
                      className="text-[10px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full"
                      style={{
                        color: cert.tagColor,
                        background: `${cert.tagColor}18`,
                        border: `1px solid ${cert.tagColor}35`,
                        fontFamily: 'Quicksand, sans-serif',
                      }}
                    >
                      {cert.tag}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden lg:block w-px self-stretch bg-white/8" />

                {/* Description */}
                <p
                  className="text-white/60 text-base leading-relaxed flex-1"
                  style={{ fontFamily: 'Source Sans 3, sans-serif' }}
                >
                  {cert.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 rounded-3xl bg-[#212121] border border-[#CABC6B]/20 p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <h3
              className="text-white font-bold text-2xl mb-2"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              ¿Necesitás la documentación técnica?
            </h3>
            <p
              className="text-white/50 text-base"
              style={{ fontFamily: 'Source Sans 3, sans-serif' }}
            >
              Certificados, fichas técnicas y análisis de laboratorio disponibles
              para distribuidores y comercios.
            </p>
          </div>
          <a
            href="https://wa.me/54?text=Hola%2C%20necesito%20la%20documentaci%C3%B3n%20t%C3%A9cnica%20de%20los%20productos%20Golden%20Harvest%20Silvia."
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-[#CABC6B] hover:bg-[#A89D4F] text-[#1B1B1B] font-bold px-7 py-3.5 rounded-full transition-all duration-300 hover:scale-105 shadow-lg shadow-[#CABC6B]/20 text-sm"
            style={{ fontFamily: 'Quicksand, sans-serif' }}
          >
            Solicitar documentación
          </a>
        </div>

      </div>
    </section>
  )
}
