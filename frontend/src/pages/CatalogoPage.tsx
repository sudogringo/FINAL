import ProductList from '../features/products/components/ProductList'

export default function CatalogoPage() {
  return (
    <main className="min-h-screen bg-[#1B1B1B] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12">
          <span className="text-[11px] font-heading font-bold tracking-[0.35em] text-gold uppercase">
            Golden Harvest — Catálogo
          </span>
          <h1 className="text-4xl lg:text-5xl font-heading font-bold text-white mt-3 mb-4 leading-tight">
            Nuestros Productos
          </h1>
          <p className="text-white/40 font-body text-[15px] max-w-xl leading-relaxed">
            Conservas artesanales seleccionadas. Elegí los productos y presentaciones que necesitás
            — un asesor armará la cotización personalizada para tu negocio.
          </p>
          <div
            className="mt-6 w-16 h-0.5"
            style={{ background: 'linear-gradient(90deg, #CABC6B, transparent)' }}
          />
        </div>

        <ProductList />
      </div>
    </main>
  )
}
