import { useEffect, useRef, useState } from 'react'
import { X, ImagePlus, Trash2 } from 'lucide-react'
import type { ApiProduct, ProductInput } from '../api'
import { uploadImage } from '../api'
import { useAdmin } from '../AdminContext'

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
  stockBySize: {},
  imageUrl: null,
  active: true,
}

export default function ProductFormModal({ product, onClose, onSave }: Props) {
  const { token } = useAdmin()
  const [form, setForm]           = useState<ProductInput>(EMPTY)
  const [sizesInput, setSizesInput] = useState('')
  const [loading, setLoading]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        line: product.line,
        description: product.description,
        sizes: product.sizes,
        tag: product.tag ?? '',
        stockBySize: product.stockBySize ?? {},
        imageUrl: product.imageUrl,
        active: product.active,
      })
      setSizesInput(product.sizes.join(', '))
    } else {
      setForm(EMPTY)
      setSizesInput('')
    }
  }, [product])

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !token) return
    setUploading(true)
    setError('')
    try {
      const url = await uploadImage(token, file)
      setForm(f => ({ ...f, imageUrl: url }))
    } catch {
      setError('No se pudo subir la imagen')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

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

  const isRed = form.line === 'roja'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-[#1a1610] border border-white/8 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative">
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

          {/* Imagen del producto */}
          <Field label="Imagen del producto">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
            {form.imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/20">
                <img
                  src={form.imageUrl}
                  alt="Vista previa"
                  className="w-full h-36 object-contain p-2"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: isRed
                      ? 'linear-gradient(to top, #2a0a08aa 0%, transparent 50%)'
                      : 'linear-gradient(to top, #1a1508aa 0%, transparent 50%)',
                  }}
                />
                <div className="absolute bottom-2 right-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-heading px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <ImagePlus size={11} />
                    {uploading ? 'Subiendo...' : 'Cambiar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, imageUrl: null }))}
                    className="flex items-center gap-1 bg-red-900/40 hover:bg-red-900/70 text-red-400 text-[11px] font-heading px-2 py-1 rounded-lg transition-colors"
                  >
                    <Trash2 size={11} />
                    Quitar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center justify-center gap-2 w-full h-24 border border-dashed border-white/20 hover:border-gold/40 rounded-xl text-white/30 hover:text-gold/60 transition-colors text-sm font-body disabled:opacity-50"
              >
                <ImagePlus size={18} />
                {uploading ? 'Subiendo...' : 'Subir imagen'}
              </button>
            )}
          </Field>

          {/* Stock por tamaño */}
          {sizesInput.split(',').map(s => s.trim()).filter(Boolean).map(s => (
            <Field key={s} label={`Stock — ${s}`}>
              <input
                type="number"
                min={0}
                value={(form.stockBySize ?? {})[s] ?? 0}
                onChange={e => setForm(f => ({
                  ...f,
                  stockBySize: { ...(f.stockBySize ?? {}), [s]: Math.max(0, parseInt(e.target.value) || 0) },
                }))}
                className={inputCls + ' [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'}
              />
            </Field>
          ))}

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
              disabled={loading || uploading}
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
