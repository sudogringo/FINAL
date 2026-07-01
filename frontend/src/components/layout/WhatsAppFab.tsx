import { MessageCircle } from 'lucide-react'

export default function WhatsAppFab() {
  const url =
    'https://wa.me/54?text=Hola%20Golden%20Harvest%2C%20me%20gustar%C3%ADa%20consultar%20sobre%20sus%20productos.'

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-3"
      aria-label="Contactar por WhatsApp"
    >
      {/* Tooltip */}
      <span
        className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 bg-[#1B1B1B] text-white text-sm font-semibold px-4 py-2 rounded-full shadow-xl whitespace-nowrap border border-white/10"
        style={{ fontFamily: 'Quicksand, sans-serif' }}
      >
        ¿Consultás por WhatsApp?
      </span>

      {/* Button */}
      <div className="relative w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#128C7E] flex items-center justify-center shadow-xl shadow-[#25D366]/40 hover:shadow-[#25D366]/60 hover:scale-110 transition-all duration-300">
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
        <MessageCircle size={26} className="text-white relative z-10" />
      </div>
    </a>
  )
}
