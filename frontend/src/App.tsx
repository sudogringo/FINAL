import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ProductLines from './components/ProductLines'
import Production from './components/Production'
import Certifications from './components/Certifications'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'
import WhatsAppFab from './components/WhatsAppFab'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProductLines />
        <Production />
        <Certifications />
        <About />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  )
}

export default App
