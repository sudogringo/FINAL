import { X, Minus, Plus, Trash2, ShoppingBag, ShoppingCart } from 'lucide-react'
import { useCart } from '../CartContext'

export default function CartDrawer() {
  const { items, isOpen, totalItems, removeItem, setQty, closeCart, openQuote } = useCart()

  return (
    <>
      {/* Backdrop */}
      <div
        role="presentation"
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <aside
        aria-label="Carrito de pedido"
        className={`fixed top-0 right-0 z-[70] h-full w-full max-w-sm bg-[#1a1610] border-l border-white/8 flex flex-col shadow-2xl transition-transform duration-400 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <ShoppingCart size={18} className="text-gold" />
            <span className="text-white font-heading font-bold text-[16px]">Mi Pedido</span>
            {totalItems > 0 && (
              <span className="bg-gold text-dark text-[10px] font-heading font-bold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="text-white/40 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/15">
                <ShoppingBag size={28} />
              </div>
              <div>
                <p className="text-white/40 text-[14px] font-body mb-1">Tu pedido está vacío.</p>
                <p className="text-white/20 text-[12px] font-body">Explorá el catálogo y agregá productos.</p>
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-3" aria-label="Productos en el pedido">
              {items.map(item => {
                const isRed  = item.line === 'roja'
                const accent = isRed ? '#C0392B' : '#CABC6B'
                return (
                  <li
                    key={`${item.id}-${item.size}`}
                    className="flex gap-3 p-4 rounded-2xl border"
                    style={{ background: '#252016', borderColor: `${accent}20` }}
                  >
                    {/* Line indicator */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ background: accent }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[13px] font-heading font-bold leading-tight truncate">{item.name}</p>
                      <p className="text-white/35 text-[11px] font-body mt-0.5">{item.size}</p>
                      {/* Qty controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => setQty(item.id, item.size, item.qty - 1)}
                          aria-label="Reducir"
                          className="w-6 h-6 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors"
                        >
                          <Minus size={10} className="text-white/60" />
                        </button>
                        <span className="text-white text-[13px] font-heading font-bold w-5 text-center">{item.qty}</span>
                        <button
                          onClick={() => setQty(item.id, item.size, item.qty + 1)}
                          aria-label="Aumentar"
                          className="w-6 h-6 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors"
                        >
                          <Plus size={10} className="text-white/60" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.id, item.size)}
                      aria-label={`Eliminar ${item.name}`}
                      className="text-white/20 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer CTA */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-white/8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/40 text-[12px] font-body">
                {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
              </span>
              <span className="text-gold text-[12px] font-heading font-semibold">Cotización personalizada</span>
            </div>
            <button
              onClick={openQuote}
              className="w-full bg-gold hover:bg-gold-dark text-dark font-heading font-bold py-4 rounded-2xl transition-colors duration-300 shadow-lg shadow-gold/20 text-[13px] tracking-wide"
            >
              Solicitar Cotización
            </button>
            <p className="text-white/25 text-[11px] text-center mt-3 font-body">
              Un asesor responde en minutos por WhatsApp o email.
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
