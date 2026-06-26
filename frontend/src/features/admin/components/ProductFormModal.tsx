import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { ApiProduct, ProductInput } from '../api'

interface Props {
  product?: ApiProduct | null
  onClose: () => void
  onSave: (data: ProductInput) => Promise<void>
}

const EMPTY: ProductInput = {
  name: '',
  line: 'roja',
  description: '',
  sizes: [],
  tag: '',
  active: true,
}

export default function ProductFormModal({ product, onClose, onSave }: Props) {
  const [form, setForm] = useState<ProductInput>(EMPTY)
  const [sizesInput, setSizesInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        line: product.line,
        description: product.description,
        sizes: product.sizes,
        tag: product.tag ?? '',
        active: product.active,
      })
      setSizesInput(product.sizes.join(', '))
    } else {
      setForm(EMPTY)
      setSizesInput('')
    }
  }, [product])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const sizes = sizesInput.split(',').map(s => s.trim()).filter(Boolean)
    if (!sizes.length) { setError('Agregá al menos un tamaño'); return }

    setLoading(true)
    try {
      await onSave({ ...form, sizes })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-[#1a1610] border border-white/8 rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <h2 className="text-white font-heading font-bold text-base mb-5">
          {product ? 'Editar producto' : 'Nuevo producto'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Field label="Nombre">
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
              className={inputCls}
              placeholder="Tomate Entero Pelado"
            />
          </Field>

          <Field label="Línea">
            <select
              value={form.line}
              onChange={e => setForm(f => ({ ...f, line: e.target.value as 'roja' | 'dorada' }))}
              className={inputCls}
            >
              <option value="roja">Línea Roja</option>
              <option value="dorada">Línea Dorada</option>
            </select>
          </Field>

          <Field label="Descripción">
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              required
              rows={2}
              className={inputCls + ' resize-none'}
              placeholder="Descripción del producto..."
            />
          </Field>

          <Field label="Tamaños (separados por coma)">
            <input
              value={sizesInput}
              onChange={e => setSizesInput(e.target.value)}
              className={inputCls}
              placeholder="250g, 1kg, 4kg"
            />
          </Field>

          <Field label="Etiqueta (opcional)">
            <input
              value={form.tag ?? ''}
              onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
              className={inputCls}
              placeholder="Clásico, Premium..."
            />
          </Field>

          <label className="flex items-center gap-2 text-white/60 text-xs font-body cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
              className="accent-gold"
            />
            Producto activo (visible en el catálogo)
          </label>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-white/10 text-white/60 hover:text-white rounded-xl py-2 text-sm font-heading transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gold hover:bg-gold-dark text-dark font-heading font-bold rounded-xl py-2 text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputCls = 'bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-body w-full focus:outline-none focus:border-gold/50'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-white/60 text-xs font-body">{label}</label>
      {children}
    </div>
  )
}
