import { MessageCircle, Mail, MapPin } from 'lucide-react'

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

export default function Contact() {
  const whatsappUrl = 'https://wa.me/54?text=Hola%20Golden%20Harvest%2C%20me%20gustar%C3%ADa%20consultar%20sobre%20sus%20productos.'

  return (
    <section id="contacto" className="py-28 bg-[#1B1B1B]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="inline-block text-[#CABC6B] text-xs font-semibold tracking-[0.35em] uppercase mb-4"
            style={{ fontFamily: 'Quicksand, sans-serif' }}
          >
            Contacto
          </span>
          <h2
            className="text-4xl lg:text-5xl font-bold text-white leading-tight"
            style={{ fontFamily: 'Quicksand, sans-serif' }}
          >
            ¿Te interesa un producto?
            <br />
            <span className="text-gradient-gold">Hablemos.</span>
          </h2>
          <p
            className="mt-4 text-white/50 text-lg max-w-lg mx-auto"
            style={{ fontFamily: 'Source Sans 3, sans-serif' }}
          >
            Nuestro equipo de ventas está listo para asesorarte y armar
            tu pedido personalizado.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* WhatsApp CTA — main */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-[#212121] border border-[#25D366]/30 p-10 flex flex-col justify-between group hover:border-[#25D366]/60 hover:shadow-2xl hover:shadow-[#25D366]/10 transition-all duration-500">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#25D366]/5" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-[#25D366]/5" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#25D366]/20 flex items-center justify-center">
                  <MessageCircle size={24} className="text-[#25D366]" />
                </div>
                <div>
                  <div className="text-white font-bold" style={{ fontFamily: 'Quicksand, sans-serif' }}>WhatsApp</div>
                  <div className="text-white/40 text-sm">Respuesta inmediata</div>
                </div>
              </div>

              <h3
                className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                Consultá tu pedido<br />en minutos
              </h3>
              <p
                className="text-white/50 text-base leading-relaxed mb-8 max-w-md"
                style={{ fontFamily: 'Source Sans 3, sans-serif' }}
              >
                Armá tu carrito, elegí los productos que querés y te ayudamos
                a cerrar tu compra con atención personalizada — sin formularios
                ni esperas.
              </p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-base px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-[#25D366]/30 hover:shadow-[#25D366]/50 hover:scale-[1.02] self-start"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              <MessageCircle size={20} />
              Iniciar Consulta por WhatsApp
            </a>
          </div>

          {/* Social + Info */}
          <div className="flex flex-col gap-6">
            {/* Redes */}
            <div className="rounded-3xl bg-[#212121] border border-white/8 p-6 flex flex-col gap-4">
              <h4
                className="text-white font-bold text-sm tracking-widest uppercase"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                Seguinos
              </h4>
              <a
                href="https://www.instagram.com/silvia_golden_harvest"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors duration-200 group/link"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E1306C] to-[#833AB4] flex items-center justify-center text-white">
                  <InstagramIcon size={18} />
                </div>
                <div>
                  <div className="text-white text-sm font-semibold group-hover/link:text-[#CABC6B] transition-colors"
                    style={{ fontFamily: 'Quicksand, sans-serif' }}>
                    Instagram
                  </div>
                  <div className="text-white/40 text-xs">@silvia_golden_harvest</div>
                </div>
              </a>
              <a
                href="https://www.facebook.com/silvia.goldenharvestsa"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors duration-200 group/link"
              >
                <div className="w-9 h-9 rounded-xl bg-[#1877F2] flex items-center justify-center text-white">
                  <FacebookIcon size={18} />
                </div>
                <div>
                  <div className="text-white text-sm font-semibold group-hover/link:text-[#CABC6B] transition-colors"
                    style={{ fontFamily: 'Quicksand, sans-serif' }}>
                    Facebook
                  </div>
                  <div className="text-white/40 text-xs">silvia.goldenharvestsa</div>
                </div>
              </a>
            </div>

            {/* Info */}
            <div className="rounded-3xl bg-[#212121] border border-white/8 p-6 flex flex-col gap-4">
              <h4
                className="text-white font-bold text-sm tracking-widest uppercase"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                Información
              </h4>
              {[
                { icon: Mail, text: 'info@goldenharvest.com.ar' },
                { icon: MapPin, text: 'Argentina' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <item.icon size={16} className="text-[#CABC6B] shrink-0" />
                  <span
                    className="text-white/60 text-sm"
                    style={{ fontFamily: 'Source Sans 3, sans-serif' }}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
