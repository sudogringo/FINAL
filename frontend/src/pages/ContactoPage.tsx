import Contact from '../components/Contact'

export default function ContactoPage() {
  return (
    <main className="relative min-h-screen bg-cream overflow-hidden flex flex-col">
      {/* Decorative background elements — misma familia visual que el Hero */}
      <div className="absolute -top-40 -right-40 w-[560px] h-[560px] rounded-full border border-gold/10 pointer-events-none" />
      <div className="absolute -bottom-52 -left-52 w-[460px] h-[460px] rounded-full bg-gold/5 pointer-events-none" />
      <div className="absolute top-1/3 -left-24 w-[220px] h-[220px] rounded-full border border-gold/10 pointer-events-none" />

      <div className="relative z-10 flex-1 flex items-center pt-28 pb-16">
        <Contact />
      </div>
    </main>
  )
}
