import { useState, useMemo, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { fetchProducts, type ApiProduct } from '../../admin/api'
import type { Product } from '../../../data/products'
import ProductCard from './ProductCard'

type Filter = 'all' | 'roja' | 'dorada'

function toProduct(p: ApiProduct): Product {
  return { id: p.id, name: p.name, line: p.line, description: p.description, sizes: p.sizes, tag: p.tag ?? '', stockBySize: p.stockBySize ?? {}, imageUrl: p.imageUrl }
}

export default function ProductList() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProducts()
      .then(data => setAllProducts(data.map(toProduct)))
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const base = useMemo(
    () => filter === 'all' ? allProducts : allProducts.filter(p => p.line === filter),
    [allProducts, filter]
  )

  const products = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return base
    return base.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tag.toLowerCase().includes(q)
    )
  }, [base, search])

  const TABS: { id: Filter; label: string; count: number }[] = [
    { id: 'all',    label: 'Todo',         count: allProducts.length },
    { id: 'roja',   label: 'Línea Roja',   count: allProducts.filter(p => p.line === 'roja').length },
    { id: 'dorada', label: 'Línea Dorada', count: allProducts.filter(p => p.line === 'dorada').length },
  ]

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div className="flex gap-6">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`pb-2 border-b-2 text-[11px] font-heading font-bold tracking-[0.15em] uppercase transition-colors duration-200 ${
                filter === t.id ? 'border-gold text-dark' : 'border-transparent text-dark/40 hover:text-dark/60'
              }`}
            >
              {t.label} · {t.count}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-dark/35" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            aria-label="Buscar producto"
            className="w-full bg-transparent border-b border-dark/15 text-dark placeholder:text-dark/35 pl-6 pr-6 py-1.5 text-[13px] font-body focus:outline-none focus:border-gold/60 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-0 top-1/2 -translate-y-1/2 text-dark/35 hover:text-dark/60">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-dark/5 animate-pulse" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-dark/40 text-[15px] font-body">
            No se encontraron productos para <span className="text-gold-dark">"{search}"</span>
          </p>
          <button onClick={() => setSearch('')} className="mt-3 text-gold-dark/70 hover:text-gold-dark text-[12px] font-heading uppercase tracking-widest transition-colors">
            Limpiar búsqueda
          </button>
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-dark/10 flex flex-col sm:flex-row justify-between gap-2">
        <p className="text-dark/35 text-[12px] font-body">
          Precios por cotización según volumen y destino.{' '}
          <span className="text-gold-dark font-heading font-semibold">Sin pedido mínimo.</span>
        </p>
        <p className="text-dark/35 text-[12px] font-body">
          {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
