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

  const isRed  = product.line === 'roja'
  const accent = isRed ? '#C0392B' : '#A89D4F'

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addItem({ id: product.id, name: product.name, line: product.line, size })
    }
    setAdded(true)
    setTimeout(() => { setAdded(false); setQty(1) }, 1800)
  }

  return (
    <article
      data-testid="product-card"
      className="flex flex-col rounded-2xl overflow-hidden border border-white/8 bg-[#212121] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ boxShadow: `0 4px 20px rgba(0,0,0,0.3)` }}
    >
      {/* Header */}
      <div
        className="relative px-5 pt-5 pb-7"
        style={{
          background: isRed
            ? 'linear-gradient(135deg, #2a0a08 0%, #6b1510 100%)'
            : 'linear-gradient(135deg, #1a1508 0%, #5a4a10 100%)',
          borderBottom: `2px solid ${accent}`,
        }}
      >
        <span
          className="text-[9px] font-heading font-bold tracking-[0.4em] uppercase mb-3 block"
          style={{ color: accent }}
        >
          {product.line === 'roja' ? 'Línea Roja' : 'Línea Dorada'}
        </span>
        <h3
          className="text-white font-display font-bold leading-tight"
          style={{ fontSize: 'clamp(16px, 2vw, 19px)' }}
        >
          {product.name}
        </h3>
        <span
          className="absolute top-4 right-4 text-[9px] font-heading font-semibold px-2 py-0.5 rounded-full"
          style={{ background: `${accent}25`, color: accent }}
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
          <p className="text-white/25 text-[9px] font-heading font-bold tracking-[0.4em] uppercase mb-2">
            Cantidad
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-colors"
              aria-label="Reducir cantidad"
            >
              <Minus size={12} />
            </button>
            <span className="text-white font-heading font-bold text-[16px] w-6 text-center">{qty}</span>
            <button
              onClick={() => setQty(q => q + 1)}
              className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-colors"
              aria-label="Aumentar cantidad"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        {/* Add button */}
        <button
          onClick={handleAdd}
          data-testid="add-to-cart"
          disabled={added}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-heading font-bold text-[12px] tracking-[0.1em] uppercase transition-all duration-300"
          style={added
            ? { background: '#166534', color: '#fff', border: '1.5px solid #166534' }
            : { background: accent, color: isRed ? '#fff' : '#1C1810', border: `1.5px solid ${accent}` }
          }
        >
          {added
            ? <><Check size={14} strokeWidth={2.5} />Agregado al pedido</>
            : <><ShoppingBag size={14} />Agregar al Pedido</>
          }
        </button>
      </div>
    </article>
  )
}
