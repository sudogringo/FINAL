import Hero from '../components/Hero'
import About from '../components/About'
import Certifications from '../components/Certifications'
import Production from '../components/Production'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <About />
      <Production />
      <Certifications />
    </main>
  )
}
