import { useState, useEffect } from 'react'
import { Check, Plus, Minus } from 'lucide-react'
import { type Product } from '../../../data/products'
import { useCart } from '../../cart/CartContext'
import { logInteraction } from '../../admin/api'


interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart()
  const [size, setSize]   = useState(product.sizes[0])
  const [qty, setQty]     = useState(1)
  const [added, setAdded] = useState(false)

  const sessionId = sessionStorage.getItem('gh_session_id') ?? 'unknown'

  useEffect(() => {
    logInteraction({ sessionId, productId: product.id, tipo: 'vista' })
  }, [product.id])

  const accent   = product.line === 'roja' ? '#C0392B' : '#A89D4F'
  const imageUrl = product.imageUrl

  const stockForSize = product.stockBySize[size] ?? 0
  const maxQty       = stockForSize > 0 ? stockForSize : Infinity
  const atLimit      = qty >= maxQty
  const noStock      = stockForSize === 0

  const handleAdd = () => {
    if (noStock) return
    const safeQty = Math.min(qty, stockForSize)
    for (let i = 0; i < safeQty; i++) {
      addItem({ id: product.id, name: product.name, line: product.line, size, stockForSize })
    }
    logInteraction({ sessionId, productId: product.id, tipo: 'carrito' })
    setAdded(true)
    setTimeout(() => { setAdded(false); setQty(1) }, 1800)
  }

  return (
    <article
      data-testid="product-card"
      className="group flex flex-col rounded-2xl overflow-hidden border border-dark/10 bg-[#EEEBE2] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-dark/5"
    >
      {/* Imagen */}
      <div className="relative h-44 bg-white flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2" style={{ background: accent }} />
            <span
              className="text-[10px] font-heading font-bold tracking-[0.2em] uppercase"
              style={{ color: accent }}
            >
              {product.line === 'roja' ? 'Línea Roja' : 'Línea Dorada'}
            </span>
          </div>
          <h3 className="text-dark font-heading font-bold text-lg leading-tight">
            {product.name}
          </h3>
        </div>

        <p className="text-dark/50 text-[13px] font-body leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Size selector */}
        <div>
          <p className="text-dark/35 text-[9px] font-heading font-bold tracking-[0.3em] uppercase mb-2">
            Presentación
          </p>
          <div className="flex gap-2">
            {product.sizes.map(s => (
              <button
                key={s}
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                className={`flex-1 py-2 rounded-xl text-[12px] font-heading font-bold border transition-all duration-200 ${
                  size === s
                    ? 'bg-dark text-white border-dark'
                    : 'bg-white text-dark/60 border-dark/15 hover:border-dark/30'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Qty selector */}
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              disabled={noStock}
              className="w-8 h-8 rounded-full border border-dark/15 flex items-center justify-center text-dark/50 hover:text-dark hover:border-dark/30 transition-colors shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Reducir cantidad"
            >
              <Minus size={12} />
            </button>
            <input
              type="number"
              min={1}
              max={stockForSize > 0 ? stockForSize : undefined}
              value={qty}
              disabled={noStock}
              onChange={e => {
                const v = parseInt(e.target.value, 10)
                if (!isNaN(v) && v >= 1) setQty(Math.min(v, maxQty))
                else if (e.target.value === '') setQty(1)
              }}
              onBlur={e => { if (!e.target.value || parseInt(e.target.value) < 1) setQty(1) }}
              className="w-10 text-center bg-transparent text-dark font-heading font-bold text-[15px] focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none disabled:opacity-30"
              aria-label="Cantidad"
            />
            <button
              onClick={() => setQty(q => Math.min(q + 1, maxQty))}
              disabled={noStock || atLimit}
              className="w-8 h-8 rounded-full border border-dark/15 flex items-center justify-center text-dark/50 hover:text-dark hover:border-dark/30 transition-colors shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Aumentar cantidad"
            >
              <Plus size={12} />
            </button>
            {stockForSize > 0 && (
              <p className="ml-auto text-dark/35 text-[10px] font-body">
                Disponible: <span className={atLimit ? 'text-red-line/80' : 'text-dark/45'}>{stockForSize.toLocaleString('es-AR')}</span>
              </p>
            )}
          </div>
          {atLimit && !noStock && (
            <p className="text-red-line/70 text-[9px] font-body mt-1.5">Límite de stock alcanzado</p>
          )}
        </div>

        {/* Add button */}
        <button
          onClick={handleAdd}
          data-testid="add-to-cart"
          disabled={added || noStock}
          className="w-full py-3.5 rounded-full font-heading font-bold text-[13px] transition-all duration-300 disabled:cursor-not-allowed"
          style={noStock
            ? { background: '#FFFFFF', color: 'rgba(27,27,27,0.3)' }
            : added
              ? { background: '#166534', color: '#fff' }
              : { background: '#CABC6B', color: '#1B1B1B' }
          }
        >
          {noStock
            ? 'Sin stock'
            : added
              ? <span className="inline-flex items-center gap-2"><Check size={14} strokeWidth={2.5} />Agregado al pedido</span>
              : 'Agregar al Pedido'
          }
        </button>
      </div>
    </article>
  )
}
