import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { ALL_PRODUCTS, RED_PRODUCTS, GOLDEN_PRODUCTS } from '../../../data/products'
import ProductCard from './ProductCard'

type Filter = 'all' | 'roja' | 'dorada'

export default function ProductList() {
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const base = filter === 'roja' ? RED_PRODUCTS : filter === 'dorada' ? GOLDEN_PRODUCTS : ALL_PRODUCTS

  const products = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return base
    return base.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tag.toLowerCase().includes(q)
    )
  }, [base, search])

  const TABS: { id: Filter; label: string; color: string }[] = [
    { id: 'all',    label: 'Todo',         color: '#CABC6B' },
    { id: 'roja',   label: 'Línea Roja',   color: '#C0392B' },
    { id: 'dorada', label: 'Línea Dorada', color: '#A89D4F' },
  ]

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-full bg-white/5 self-start">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className="px-4 py-2 rounded-full text-[11px] font-heading font-bold tracking-wide transition-all duration-250"
              style={filter === t.id
                ? { background: t.color, color: t.id === 'all' ? '#1C1810' : t.id === 'dorada' ? '#1C1810' : '#fff',
                    boxShadow: `0 2px 12px ${t.color}40` }
                : { color: 'rgba(255,255,255,0.35)' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            aria-label="Buscar producto"
            className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/25 rounded-full pl-9 pr-9 py-2.5 text-[13px] font-body focus:outline-none focus:border-gold/40 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-white/30 text-[15px] font-body">
            No se encontraron productos para <span className="text-gold/60">"{search}"</span>
          </p>
          <button onClick={() => setSearch('')} className="mt-3 text-gold/50 hover:text-gold text-[12px] font-heading uppercase tracking-widest transition-colors">
            Limpiar búsqueda
          </button>
        </div>
      )}

      {/* Footer note */}
      <div className="mt-10 pt-6 border-t border-white/8 flex flex-col sm:flex-row justify-between gap-2">
        <p className="text-white/20 text-[12px] font-body">
          Precios por cotización según volumen y destino.{' '}
          <span className="text-gold/40 font-heading font-semibold">Sin pedido mínimo.</span>
        </p>
        <p className="text-white/20 text-[12px] font-body">
          {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
