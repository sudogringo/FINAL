import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import type { ApiProduct } from '../../admin/api'
import { useProducts } from '../useProducts'
import type { Product } from '../../../data/products'
import ProductCard from './ProductCard'

type Filter = 'all' | 'roja' | 'dorada'

function toProduct(p: ApiProduct): Product {
  return { id: p.id, name: p.name, line: p.line, description: p.description, sizes: p.sizes, tag: p.tag ?? '', stockBySize: p.stockBySize ?? {}, imageUrl: p.imageUrl }
}

export default function ProductList() {
  const { products: apiProducts, status, retry, canRetry } = useProducts()
  const allProducts = useMemo(() => apiProducts.map(toProduct), [apiProducts])
  const loading = status === 'loading' || status === 'waking'
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

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
                filter === t.id ? 'border-gold text-dark' : 'border-transparent text-dark/65 hover:text-dark'
              }`}
            >
              {t.label} · {t.count}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-dark/65" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            aria-label="Buscar producto"
            className="w-full bg-transparent border-b border-dark/15 text-dark placeholder:text-dark/65 pl-6 pr-6 py-1.5 text-[13px] font-body focus:outline-none focus:border-gold/60 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-0 top-1/2 -translate-y-1/2 text-dark/65 hover:text-dark">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {status === 'waking' && (
        <p role="status" aria-live="polite" className="mb-6 text-dark/70 text-[14px] font-body">
          Despertando el servidor… el catálogo se aloja en un servicio gratuito que tarda hasta un minuto en iniciar. Gracias por esperar.
        </p>
      )}
      {status === 'unavailable' && (
        <div role="status" aria-live="polite" className="text-center py-16">
          <p className="text-dark/70 text-[15px] font-body">
            Catálogo no disponible por el momento. Probá de nuevo en unos minutos.
          </p>
          {canRetry && (
            <button onClick={retry} className="mt-3 text-gold-text hover:text-dark text-[12px] font-heading uppercase tracking-widest transition-colors">
              Reintentar
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div aria-hidden="true" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-dark/5 animate-pulse" />
          ))}
        </div>
      ) : status === 'unavailable' ? null : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-dark/65 text-[15px] font-body">
            No se encontraron productos para <span className="text-gold-text">"{search}"</span>
          </p>
          <button onClick={() => setSearch('')} className="mt-3 text-gold-text hover:text-dark text-[12px] font-heading uppercase tracking-widest transition-colors">
            Limpiar búsqueda
          </button>
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-dark/10 flex flex-col sm:flex-row justify-between gap-2">
        <p className="text-dark/65 text-[12px] font-body">
          Precios por cotización según volumen y destino.{' '}
          <span className="text-gold-text font-heading font-semibold">Sin pedido mínimo.</span>
        </p>
        <p className="text-dark/65 text-[12px] font-body">
          {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
