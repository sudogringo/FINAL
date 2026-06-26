import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, LogOut, RefreshCw } from 'lucide-react'
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
const LINE_COLOR = { roja: 'bg-red-900/40 text-red-300', dorada: 'bg-yellow-900/40 text-yellow-300' }

export default function AdminProductsPage() {
  const { token, logout, isAuthenticated } = useAdmin()
  const navigate = useNavigate()
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalProduct, setModalProduct] = useState<ApiProduct | null | undefined>(undefined)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/admin/login'); return }
    load()
  }, [isAuthenticated])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAllProductsAdmin(token!)
      setProducts(data)
    } catch {
      setError('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(data: ProductInput) {
    if (modalProduct) {
      await updateProduct(token!, modalProduct.id, data)
    } else {
      await createProduct(token!, data)
    }
    await load()
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`¿Desactivar "${name}"? No se eliminará, solo dejará de mostrarse en el catálogo.`)) return
    await deleteProduct(token!, id)
    await load()
  }

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="border-b border-white/8 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-gold font-heading font-bold text-lg">Golden Harvest</h1>
          <p className="text-white/40 text-xs font-body">Panel de Administración</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 text-white/40 hover:text-white transition-colors"
            aria-label="Recargar"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm font-body transition-colors"
          >
            <LogOut size={15} />
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-heading font-bold text-xl">Productos</h2>
          <button
            onClick={() => setModalProduct(null)}
            className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-dark font-heading font-bold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            <Plus size={15} />
            Nuevo producto
          </button>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {loading ? (
          <p className="text-white/40 text-sm font-body">Cargando...</p>
        ) : (
          <div className="flex flex-col gap-2">
            {products.map(product => (
              <div
                key={product.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border ${
                  product.active ? 'bg-[#1a1610] border-white/8' : 'bg-white/3 border-white/4 opacity-50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-heading font-bold text-sm truncate">{product.name}</p>
                    <span className={`text-[10px] font-heading font-bold px-2 py-0.5 rounded-full ${LINE_COLOR[product.line]}`}>
                      {LINE_LABEL[product.line]}
                    </span>
                    {!product.active && (
                      <span className="text-[10px] font-heading font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/40">
                        Inactivo
                      </span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs font-body truncate">{product.description}</p>
                  <p className="text-white/25 text-xs font-body mt-0.5">{product.sizes.join(' · ')}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setModalProduct(product)}
                    className="p-2 text-white/30 hover:text-gold transition-colors"
                    aria-label={`Editar ${product.name}`}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="p-2 text-white/30 hover:text-red-400 transition-colors"
                    aria-label={`Desactivar ${product.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
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
