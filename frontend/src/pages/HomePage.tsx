import Hero from '../components/Hero'
import About from '../components/About'
import Certifications from '../components/Certifications'
import Production from '../components/Production'

function SectionDivider() {
  return (
    <div className="bg-[#FBFBFB] flex items-center justify-center gap-3 py-1">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#CABC6B]/40" />
      <span className="w-1.5 h-1.5 rotate-45 bg-[#CABC6B]/50" />
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#CABC6B]/40" />
    </div>
  )
}

export default function HomePage() {
  return (
    <main>
      <Hero />
      <About />
      <SectionDivider />
      <Production />
      <Certifications />
    </main>
  )
}
