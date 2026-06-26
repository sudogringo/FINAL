import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, LogOut, RefreshCw, Search, X, RotateCcw } from 'lucide-react'
import { useAdmin } from '../../features/admin/AdminContext'
import {
  fetchAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  type ApiProduct,
  type ProductInput,
} from '../../features/admin/api'
import ProductFormModal from '../../features/admin/components/ProductFormModal'

const LINE_LABEL = { roja: 'Línea Roja', dorada: 'Línea Dorada' }
const LINE_COLOR  = { roja: 'bg-red-900/40 text-red-300', dorada: 'bg-yellow-900/40 text-yellow-300' }

type LineFilter   = 'all' | 'roja' | 'dorada'
type StatusFilter = 'active' | 'inactive' | 'all'

export default function AdminProductsPage() {
  const { token, logout, isAuthenticated } = useAdmin()
  const navigate = useNavigate()

  const [products,     setProducts]     = useState<ApiProduct[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [modalProduct, setModalProduct] = useState<ApiProduct | null | undefined>(undefined)

  const [search,       setSearch]       = useState('')
  const [lineFilter,   setLineFilter]   = useState<LineFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')

  useEffect(() => {
    if (!isAuthenticated) { navigate('/admin/login'); return }
    load()
  }, [isAuthenticated])

  async function load() {
    setLoading(true); setError('')
    try   { setProducts(await fetchAllProductsAdmin(token!)) }
    catch { setError('Error al cargar productos') }
    finally { setLoading(false) }
  }

  async function handleSave(data: ProductInput) {
    if (modalProduct) await updateProduct(token!, modalProduct.id, data)
    else              await createProduct(token!, data)
    await load()
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`¿Desactivar "${name}"?\nNo se borrará, solo dejará de aparecer en el catálogo.`)) return
    await deleteProduct(token!, id)
    await load()
  }

  async function handleRestore(id: string) {
    await updateProduct(token!, id, { active: true })
    await load()
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter(p => {
      if (lineFilter   !== 'all'    && p.line !== lineFilter)         return false
      if (statusFilter === 'active' && !p.active)                     return false
      if (statusFilter === 'inactive' && p.active)                    return false
      if (q && !p.name.toLowerCase().includes(q) &&
               !p.description.toLowerCase().includes(q) &&
               !(p.tag ?? '').toLowerCase().includes(q))              return false
      return true
    })
  }, [products, search, lineFilter, statusFilter])

  const counts = useMemo(() => ({
    active:   products.filter(p =>  p.active).length,
    inactive: products.filter(p => !p.active).length,
  }), [products])

  const hasFilters = search || lineFilter !== 'all' || statusFilter !== 'active'

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="border-b border-white/8 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-gold font-heading font-bold text-lg">Golden Harvest</h1>
          <p className="text-white/40 text-xs font-body">Panel de Administración</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 text-white/40 hover:text-white transition-colors" aria-label="Recargar">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => { logout(); navigate('/admin/login') }}
            className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm font-body transition-colors">
            <LogOut size={15} /> Salir
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title row */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-heading font-bold text-xl">Productos</h2>
            <p className="text-white/30 text-xs font-body mt-0.5">
              {counts.active} activos · {counts.inactive} inactivos
            </p>
          </div>
          <button
            onClick={() => setModalProduct(null)}
            className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-dark font-heading font-bold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            <Plus size={15} /> Nuevo producto
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, descripción o etiqueta..."
              className="w-full bg-white/5 border border-white/10 text-white placeholder:text-white/25 rounded-xl pl-8 pr-8 py-2 text-xs font-body focus:outline-none focus:border-gold/40 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Line filter */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl self-start">
            {(['all', 'roja', 'dorada'] as LineFilter[]).map(v => (
              <button
                key={v}
                onClick={() => setLineFilter(v)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-heading font-bold transition-all ${
                  lineFilter === v
                    ? v === 'roja'   ? 'bg-red-900/60 text-red-300'
                    : v === 'dorada' ? 'bg-yellow-900/60 text-yellow-300'
                    :                  'bg-white/10 text-white'
                    : 'text-white/35 hover:text-white/60'
                }`}
              >
                {v === 'all' ? 'Todas' : LINE_LABEL[v]}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl self-start">
            {([
              { v: 'active',   label: `Activos (${counts.active})`     },
              { v: 'inactive', label: `Inactivos (${counts.inactive})`  },
              { v: 'all',      label: 'Todos'                           },
            ] as { v: StatusFilter; label: string }[]).map(({ v, label }) => (
              <button
                key={v}
                onClick={() => setStatusFilter(v)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-heading font-bold transition-all ${
                  statusFilter === v ? 'bg-white/10 text-white' : 'text-white/35 hover:text-white/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setLineFilter('all'); setStatusFilter('active') }}
              className="flex items-center gap-1.5 text-white/30 hover:text-white text-[11px] font-body transition-colors self-center"
            >
              <X size={11} /> Limpiar
            </button>
          )}
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {loading ? (
          <div className="flex flex-col gap-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/30 text-sm font-body">
              {products.length === 0 ? 'No hay productos cargados todavía.' : 'No se encontraron productos con esos filtros.'}
            </p>
            {hasFilters && (
              <button
                onClick={() => { setSearch(''); setLineFilter('all'); setStatusFilter('active') }}
                className="mt-3 text-gold/50 hover:text-gold text-xs font-heading uppercase tracking-widest transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(product => (
              <div
                key={product.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-opacity ${
                  product.active ? 'bg-[#1a1610] border-white/8' : 'bg-white/3 border-white/4 opacity-50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-white font-heading font-bold text-sm truncate">{product.name}</p>
                    <span className={`text-[10px] font-heading font-bold px-2 py-0.5 rounded-full shrink-0 ${LINE_COLOR[product.line]}`}>
                      {LINE_LABEL[product.line]}
                    </span>
                    {product.tag && (
                      <span className="text-[10px] font-heading font-bold px-2 py-0.5 rounded-full bg-gold/10 text-gold/60 shrink-0">
                        {product.tag}
                      </span>
                    )}
                    {!product.active && (
                      <span className="text-[10px] font-heading font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/40 shrink-0">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs font-body truncate">{product.description}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {product.sizes.map(s => {
                      const qty = (product.stockBySize ?? {})[s] ?? 0
                      return (
                        <span key={s} className={`text-[10px] font-heading font-bold px-2 py-0.5 rounded-full ${
                          qty > 100 ? 'bg-green-900/40 text-green-400'   :
                          qty > 0   ? 'bg-yellow-900/40 text-yellow-400' :
                                      'bg-red-900/40 text-red-400'
                        }`}>
                          {s}: {qty === 0 ? 'sin stock' : qty.toLocaleString('es-AR')}
                        </span>
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setModalProduct(product)}
                    className="p-2 text-white/30 hover:text-gold transition-colors"
                    aria-label={`Editar ${product.name}`}
                  >
                    <Pencil size={15} />
                  </button>
                  {product.active ? (
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="p-2 text-white/30 hover:text-red-400 transition-colors"
                      aria-label={`Desactivar ${product.name}`}
                      title="Desactivar (soft delete)"
                    >
                      <Trash2 size={15} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRestore(product.id)}
                      className="p-2 text-white/30 hover:text-green-400 transition-colors"
                      aria-label={`Restaurar ${product.name}`}
                      title="Restaurar producto"
                    >
                      <RotateCcw size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <p className="text-white/20 text-xs font-body text-right mt-2">
              {filtered.length} de {products.length} productos
            </p>
          </div>
        )}
      </main>

      {modalProduct !== undefined && (
        <ProductFormModal
          product={modalProduct}
          onClose={() => setModalProduct(undefined)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
