import ProductList from '../features/products/components/ProductList'

export default function CatalogoPage() {
  return (
    <main className="min-h-screen bg-cream pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 pb-8 border-b border-dark/15 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <span className="text-[11px] font-heading font-bold tracking-[0.35em] text-gold uppercase">
              Golden Harvest — Catálogo 2026
            </span>
            <h1 className="text-4xl lg:text-5xl font-heading text-dark mt-3 leading-tight">
              Nuestros <span className="font-bold">Productos</span>
            </h1>
          </div>
          <p className="text-dark/50 font-body text-[15px] max-w-sm leading-relaxed lg:text-right">
            Elegí productos y presentaciones: un asesor arma la cotización para tu negocio.{' '}
            <em>Sin carrito de pago, sin intermediarios.</em>
          </p>
        </div>

        <ProductList />
      </div>
    </main>
  )
}
