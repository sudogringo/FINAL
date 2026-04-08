import { ArrowDown, Leaf, Award } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#1B1B1B]">

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large golden circle - top right */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full border border-[#CABC6B]/10" />
        <div className="absolute -top-20 -right-20 w-[480px] h-[480px] rounded-full border border-[#CABC6B]/8 animate-spin-slow" />
        <div className="absolute top-16 right-16 w-[320px] h-[320px] rounded-full border border-[#CABC6B]/15" />

        {/* Bottom left accent */}
        <div className="absolute -bottom-20 -left-20 w-[350px] h-[350px] rounded-full bg-[#CABC6B]/5" />

        {/* Gold gradient strip */}
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-[#CABC6B]/60 to-transparent" />

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '256px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: Text Content */}
          <div>
            {/* Badge */}
            <div className="animate-fade-in-up inline-flex items-center gap-2 bg-[#CABC6B]/10 border border-[#CABC6B]/30 rounded-full px-4 py-2 mb-8">
              <Leaf size={14} className="text-[#CABC6B]" />
              <span className="text-[#CABC6B] text-xs font-semibold tracking-widest uppercase"
                style={{ fontFamily: 'Quicksand, sans-serif' }}>
                Calidad Premium desde el Campo
              </span>
            </div>

            {/* Headline */}
            <h1
              className="animate-fade-in-up delay-100 text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-white mb-6"
              style={{ fontFamily: 'Quicksand, sans-serif' }}
            >
              La Tradición
              <br />
              del Campo,
              <br />
              <span className="text-gradient-gold">en tu Mesa.</span>
            </h1>

            {/* Sub */}
            <p
              className="animate-fade-in-up delay-200 text-white/60 text-lg lg:text-xl leading-relaxed max-w-md mb-10"
              style={{ fontFamily: 'Source Sans 3, sans-serif' }}
            >
              Conservas artesanales de tomate y durazno con el sabor auténtico
              de la tierra. Línea Roja y Línea Dorada — para quienes no
              negocian con la calidad.
            </p>

            {/* CTAs */}
            <div className="animate-fade-in-up delay-300 flex flex-wrap gap-4 mb-14">
              <a
                href="#productos"
                className="flex items-center gap-2 bg-[#CABC6B] hover:bg-[#A89D4F] text-[#1B1B1B] font-bold px-8 py-4 rounded-full transition-all duration-300 shadow-xl shadow-[#CABC6B]/25 hover:shadow-[#CABC6B]/40 hover:scale-105 text-base"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                Explorar Productos
              </a>
              <a
                href="#nosotros"
                className="flex items-center gap-2 border border-white/20 hover:border-[#CABC6B]/50 text-white/80 hover:text-[#CABC6B] font-semibold px-8 py-4 rounded-full transition-all duration-300 text-base backdrop-blur-sm"
                style={{ fontFamily: 'Quicksand, sans-serif' }}
              >
                Nuestra Historia
              </a>
            </div>

            {/* Stats */}
            <div className="animate-fade-in-up delay-400 flex gap-10">
              {[
                { value: '2', label: 'Líneas Premium' },
                { value: '100%', label: 'Natural' },
                { value: '+20', label: 'Años de Calidad' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div
                    className="text-3xl font-bold text-[#CABC6B]"
                    style={{ fontFamily: 'Quicksand, sans-serif' }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-white/40 text-xs tracking-wide uppercase mt-0.5"
                    style={{ fontFamily: 'Source Sans 3, sans-serif' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative hidden lg:flex items-center justify-center">
            {/* Outer ring */}
            <div className="animate-spin-slow absolute w-[460px] h-[460px] rounded-full border border-dashed border-[#CABC6B]/20" />

            {/* Main golden circle */}
            <div className="animate-float relative w-[340px] h-[340px] rounded-full bg-gradient-to-br from-[#CABC6B]/20 to-[#CABC6B]/5 border border-[#CABC6B]/30 flex items-center justify-center shadow-2xl shadow-[#CABC6B]/10">
              <div className="w-[260px] h-[260px] rounded-full bg-gradient-to-br from-[#CABC6B]/30 to-[#A89D4F]/20 flex items-center justify-center">
                {/* Logo mark */}
                <div className="text-center">
                  <div
                    className="text-5xl font-bold text-gradient-gold"
                    style={{ fontFamily: 'Quicksand, sans-serif' }}
                  >
                    GH
                  </div>
                  <div
                    className="text-[10px] font-semibold tracking-[0.4em] text-[#CABC6B]/60 uppercase mt-1"
                    style={{ fontFamily: 'Quicksand, sans-serif' }}
                  >
                    Silvia
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute top-8 right-4 animate-fade-in-up delay-500">
              <div className="bg-[#212121] border border-[#CABC6B]/30 rounded-2xl px-4 py-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-[#CABC6B]" />
                  <div>
                    <div className="text-white text-xs font-bold" style={{ fontFamily: 'Quicksand, sans-serif' }}>Certificado</div>
                    <div className="text-white/40 text-[10px]">Calidad Premium</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-12 left-0 animate-fade-in-up delay-600">
              <div className="bg-[#212121] border border-[#C0392B]/30 rounded-2xl px-4 py-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#C0392B]" />
                  <div>
                    <div className="text-white text-xs font-bold" style={{ fontFamily: 'Quicksand, sans-serif' }}>Línea Roja</div>
                    <div className="text-white/40 text-[10px]">Conservas de Tomate</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-32 right-0 animate-fade-in-up delay-700">
              <div className="bg-[#212121] border border-[#CABC6B]/30 rounded-2xl px-4 py-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#CABC6B]" />
                  <div>
                    <div className="text-white text-xs font-bold" style={{ fontFamily: 'Quicksand, sans-serif' }}>Línea Dorada</div>
                    <div className="text-white/40 text-[10px]">Conservas de Durazno</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="animate-fade-in delay-700 absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="text-xs tracking-widest uppercase" style={{ fontFamily: 'Quicksand, sans-serif' }}>Explorar</span>
          <ArrowDown size={16} className="animate-bounce" />
        </div>
      </div>
    </section>
  )
}
