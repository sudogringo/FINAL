import { useState } from 'react'
import { ShoppingBag, Check, Plus, Minus } from 'lucide-react'
import { type Product } from '../../../data/products'
import { useCart } from '../../cart/CartContext'


interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart()
  const [size, setSize]   = useState(product.sizes[0])
  const [qty, setQty]     = useState(1)
  const [added, setAdded] = useState(false)

  const isRed    = product.line === 'roja'
  const accent   = isRed ? '#C0392B' : '#A89D4F'
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
    setAdded(true)
    setTimeout(() => { setAdded(false); setQty(1) }, 1800)
  }

  return (
    <article
      data-testid="product-card"
      className="group flex flex-col rounded-2xl overflow-hidden border border-white/8 bg-[#212121] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ boxShadow: `0 4px 20px rgba(0,0,0,0.3)` }}
    >
      {/* Header */}
      <div
        className="relative overflow-hidden"
        style={{
          background: isRed
            ? 'linear-gradient(135deg, #2a0a08 0%, #6b1510 100%)'
            : 'linear-gradient(135deg, #1a1508 0%, #5a4a10 100%)',
          borderBottom: `2px solid ${accent}`,
        }}
      >
        {/* Imagen del producto */}
        {imageUrl ? (
          <div className="relative h-44 flex items-center justify-center overflow-hidden">
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-contain p-3 drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
            />
            {/* overlay sutil para que se integre con el gradiente */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: isRed
                  ? 'linear-gradient(to top, #2a0a08cc 0%, transparent 50%)'
                  : 'linear-gradient(to top, #1a1508cc 0%, transparent 50%)',
              }}
            />
          </div>
        ) : (
          <div className="h-44" />
        )}

        {/* Info sobre la imagen */}
        <div className="px-5 pt-3 pb-5">
          <span
            className="text-[9px] font-heading font-bold tracking-[0.4em] uppercase mb-2 block"
            style={{ color: accent }}
          >
            {product.line === 'roja' ? 'Línea Roja' : 'Línea Dorada'}
          </span>
          <h3
            className="text-white font-display font-bold leading-tight"
            style={{ fontSize: 'clamp(15px, 2vw, 18px)' }}
          >
            {product.name}
          </h3>
        </div>

        <span
          className="absolute top-3 right-3 text-[9px] font-heading font-semibold px-2 py-0.5 rounded-full"
          style={{ background: `${accent}35`, color: accent }}
        >
          {product.tag}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        <p className="text-white/45 text-[13px] font-body leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Size selector */}
        <div>
          <p className="text-white/25 text-[9px] font-heading font-bold tracking-[0.4em] uppercase mb-2">
            Presentación
          </p>
          <div className="flex gap-2">
            {product.sizes.map(s => (
              <button
                key={s}
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                className="flex-1 py-2 rounded-xl text-[12px] font-heading font-bold transition-all duration-200"
                style={size === s
                  ? { background: accent, color: isRed ? '#fff' : '#1C1810', border: `1.5px solid ${accent}` }
                  : { background: 'transparent', color: accent, border: `1.5px solid ${accent}35` }
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Qty selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/25 text-[9px] font-heading font-bold tracking-[0.4em] uppercase">
              Cantidad
            </p>
            {stockForSize > 0 && (
              <p className="text-white/20 text-[9px] font-body">
                Disponible: <span className={atLimit ? 'text-yellow-400/70' : 'text-white/35'}>{stockForSize.toLocaleString('es-AR')}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              disabled={noStock}
              className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-colors shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
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
              className="flex-1 text-center bg-white/5 border border-white/15 rounded-xl text-white font-heading font-bold text-[15px] py-1.5 focus:outline-none focus:border-white/30 transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none disabled:opacity-30"
              aria-label="Cantidad"
            />
            <button
              onClick={() => setQty(q => Math.min(q + 1, maxQty))}
              disabled={noStock || atLimit}
              className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-colors shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Aumentar cantidad"
            >
              <Plus size={12} />
            </button>
          </div>
          {atLimit && !noStock && (
            <p className="text-yellow-400/70 text-[9px] font-body mt-1.5">Límite de stock alcanzado</p>
          )}
        </div>

        {/* Add button */}
        <button
          onClick={handleAdd}
          data-testid="add-to-cart"
          disabled={added || noStock}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-heading font-bold text-[12px] tracking-[0.1em] uppercase transition-all duration-300 disabled:cursor-not-allowed"
          style={noStock
            ? { background: '#2a2a2a', color: 'rgba(255,255,255,0.25)', border: '1.5px solid rgba(255,255,255,0.08)' }
            : added
              ? { background: '#166534', color: '#fff', border: '1.5px solid #166534' }
              : { background: accent, color: isRed ? '#fff' : '#1C1810', border: `1.5px solid ${accent}` }
          }
        >
          {noStock
            ? 'Sin stock'
            : added
              ? <><Check size={14} strokeWidth={2.5} />Agregado al pedido</>
              : <><ShoppingBag size={14} />Agregar al Pedido</>
          }
        </button>
      </div>
    </article>
  )
}
