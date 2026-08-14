import { MessageCircle, Mail, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Contact() {
  const whatsappUrl = 'https://wa.me/54?text=Hola%20Golden%20Harvest%2C%20me%20gustar%C3%ADa%20consultar%20sobre%20sus%20productos.'

  return (
    <section id="contacto" className="w-full max-w-7xl mx-auto px-6 lg:px-8">
      {/* Header */}
      <div className="pb-8 border-b border-dark/15 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-heading font-bold tracking-[0.35em] text-gold uppercase">
            Golden Harvest S.A.
          </span>
          <h1 className="text-4xl font-heading font-bold text-dark mt-2">SILVIA</h1>
        </div>
        <div className="sm:text-right">
          <p className="text-dark/40 text-[11px] font-heading font-semibold tracking-[0.2em] uppercase">
            Mendoza · Argentina
          </p>
          <p className="text-dark/40 text-[11px] font-heading font-semibold tracking-[0.2em] uppercase mt-1">
            Atención a comercios y distribuidores
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-16 mt-16">
        {/* Left */}
        <div className="lg:col-span-2">
          <h2 className="text-5xl lg:text-6xl font-heading text-dark leading-[1.1]">
            ¿Te interesa un producto?
            <br />
            <span className="font-bold">Hablemos.</span>
          </h2>
          <p className="mt-6 text-dark/50 font-body text-xl max-w-xl leading-relaxed">
            Armá tu pedido en el catálogo y un asesor te responde con la cotización, stock y logística.{' '}
            <em>Sin formularios, sin esperas.</em>
          </p>

          <div className="flex flex-wrap items-center gap-5 mt-10">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white font-heading font-bold px-8 py-4 rounded-full shadow-lg shadow-[#25D366]/25 hover:shadow-[#25D366]/40 hover:scale-[1.02] transition-all duration-300 text-base"
            >
              <MessageCircle size={20} />
              Iniciar consulta por WhatsApp
            </a>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 border border-dark/20 hover:border-gold/60 text-dark font-heading font-semibold px-8 py-4 rounded-full transition-all duration-300 text-base"
            >
              Ver el catálogo
            </Link>
          </div>

          {/* Info row */}
          <div className="mt-20 pt-8 border-t border-dark/10 flex flex-wrap gap-x-16 gap-y-6">
            <div>
              <p className="text-dark/35 text-[10px] font-heading font-bold tracking-[0.25em] uppercase mb-2">
                Correo
              </p>
              <a
                href="mailto:info@goldenharvest.com.ar"
                className="flex items-center gap-2 text-dark/70 hover:text-gold-dark text-sm transition-colors"
              >
                <Mail size={14} />
                info@goldenharvest.com.ar
              </a>
            </div>
            <div className="border-l border-dark/10 pl-16">
              <p className="text-dark/35 text-[10px] font-heading font-bold tracking-[0.25em] uppercase mb-2">
                Planta
              </p>
              <span className="flex items-center gap-2 text-dark/70 text-sm">
                <MapPin size={14} />
                Mendoza, Argentina
              </span>
            </div>
            <div className="border-l border-dark/10 pl-16">
              <p className="text-dark/35 text-[10px] font-heading font-bold tracking-[0.25em] uppercase mb-2">
                Seguinos
              </p>
              <a
                href="https://www.instagram.com/silvia_golden_harvest"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark/70 hover:text-gold-dark text-sm transition-colors"
              >
                @silvia_golden_harvest
              </a>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col items-center lg:items-end gap-8">
          <div className="relative w-64 h-64 shrink-0">
            <div className="absolute -inset-5 rounded-full border border-dashed border-gold/25 animate-spin-slow" />
            <div className="relative w-full h-full rounded-full border border-[#25D366]/30 bg-white/40 flex flex-col items-center justify-center text-center gap-1.5 shadow-sm">
              <MessageCircle size={20} className="text-[#25D366] mb-1" />
              <p className="text-dark/35 text-[10px] font-heading font-bold tracking-[0.25em] uppercase">
                Respuesta
              </p>
              <p className="text-dark font-heading font-bold text-2xl">en minutos</p>
              <span className="h-px w-10 bg-dark/15 my-1.5" />
              <p className="text-dark/40 text-xs font-body">Lun a Vie · 9 a 18h</p>
            </div>
          </div>

          <div className="w-full border border-dark/10 rounded-3xl p-7 bg-white/50">
            <p className="text-dark/35 text-[10px] font-heading font-bold tracking-[0.25em] uppercase mb-3">
              Cómo trabajamos
            </p>
            <p className="text-dark/60 text-sm font-body leading-relaxed">
              Venta consultiva: elegís los productos, un asesor confirma stock por lote y arma la
              cotización a medida de tu negocio.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
