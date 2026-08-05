import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Send, CheckCircle2, Loader2 } from 'lucide-react'
import { useCart } from '../../cart/CartContext'
import { submitQuote } from '../../admin/api'

const schema = z.object({
  nombre:   z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  empresa:  z.string().optional(),
  telefono: z.string()
    .regex(/^\+?[\d\s\-]{8,15}$/, 'Teléfono inválido (8-15 dígitos)')
    .optional()
    .or(z.literal('')),
  email:    z.string().email('Email inválido'),
  notas:    z.string().max(500, 'Máximo 500 caracteres').optional(),
})

type FormData = z.infer<typeof schema>

export default function QuoteForm() {
  const { items, quoteOpen, closeQuote, clearCart } = useCart()
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!quoteOpen) { setStatus('idle'); reset() }
  }, [quoteOpen, reset])

  const onSubmit = async (data: FormData) => {
    setStatus('sending')
    try {
      await submitQuote({
        sessionId: sessionStorage.getItem('gh_session_id') ?? crypto.randomUUID(),
        contact:   data as Record<string, string>,
        items:     items.map(i => ({ id: i.id, name: i.name, line: i.line, size: i.size, qty: i.qty })),
      })
      setStatus('done')
      reset()
    } catch {
      setStatus('error')
    }
  }

  const handleClose = () => { clearCart(); closeQuote(); setStatus('idle'); reset() }

  if (!quoteOpen) return null

  const Field = ({
    id, label, error, required = false, children,
  }: { id: string; label: string; error?: string; required?: boolean; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-white/60 text-[11px] font-heading font-semibold tracking-[0.15em] uppercase">
        {label}{required && <span className="text-[#C0392B] ml-0.5">*</span>}
      </label>
      {children}
      {error && <p role="alert" className="text-[#C0392B] text-[11px] font-body">{error}</p>}
    </div>
  )

  const inputCls = (hasErr: boolean) =>
    `w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-[13px] font-body placeholder:text-white/20 focus:outline-none transition-colors ${
      hasErr ? 'border-[#C0392B]/50 focus:border-[#C0392B]' : 'border-white/10 focus:border-gold/40'
    }`

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Formulario de cotización"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg bg-[#1a1610] border border-white/10 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-white/8">
          <div>
            <h2 className="text-white font-heading font-bold text-[18px]">Solicitar Cotización</h2>
            <p className="text-white/30 text-[12px] font-body mt-0.5">
              {items.length} producto{items.length !== 1 ? 's' : ''} en tu pedido
            </p>
          </div>
          <button onClick={handleClose} aria-label="Cerrar" className="text-white/30 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {status === 'done' ? (
          /* Success state */
          <div className="flex flex-col items-center justify-center gap-5 px-7 py-14 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-heading font-bold text-[18px] mb-2">¡Cotización enviada!</h3>
              <p className="text-white/40 text-[13px] font-body leading-relaxed">
                Un asesor de Golden Harvest se va a comunicar con vos en los próximos minutos por WhatsApp o email.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="bg-gold hover:bg-gold-dark text-dark font-heading font-bold px-8 py-3 rounded-xl transition-colors text-[13px] tracking-wide"
            >
              Cerrar
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit(onSubmit)} className="px-7 py-6 flex flex-col gap-5" noValidate>

            {/* Items summary */}
            <div className="bg-white/3 rounded-2xl p-4 flex flex-col gap-2 border border-white/5">
              <p className="text-white/25 text-[9px] font-heading font-bold tracking-[0.4em] uppercase mb-1">Productos solicitados</p>
              {items.map(i => (
                <div key={`${i.id}-${i.size}`} className="flex justify-between items-center">
                  <span className="text-white/60 text-[12px] font-body">{i.name} — {i.size}</span>
                  <span className="text-gold/60 text-[12px] font-heading font-bold">×{i.qty}</span>
                </div>
              ))}
            </div>

            <Field id="nombre" label="Nombre completo" error={errors.nombre?.message} required>
              <input id="nombre" type="text" placeholder="Juan García" className={inputCls(!!errors.nombre)} {...register('nombre')} />
            </Field>

            <Field id="empresa" label="Empresa" error={errors.empresa?.message}>
              <input id="empresa" type="text" placeholder="Distribuidora Ejemplo S.A. (opcional)" className={inputCls(false)} {...register('empresa')} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field id="telefono" label="Teléfono" error={errors.telefono?.message}>
                <input id="telefono" type="tel" placeholder="+54 9 11 0000-0000" className={inputCls(!!errors.telefono)} {...register('telefono')} />
              </Field>
              <Field id="email" label="Email" error={errors.email?.message} required>
                <input id="email" type="email" placeholder="nombre@empresa.com" className={inputCls(!!errors.email)} {...register('email')} />
              </Field>
            </div>

            <Field id="notas" label="Notas adicionales" error={errors.notas?.message}>
              <textarea
                id="notas"
                rows={3}
                placeholder="Destino de entrega, volumen estimado, condiciones especiales..."
                className={`${inputCls(!!errors.notas)} resize-none`}
                {...register('notas')}
              />
              <p className="text-white/20 text-[10px] font-body text-right">Máximo 500 caracteres</p>
            </Field>

            {status === 'error' && (
              <p role="alert" className="bg-[#C0392B]/10 border border-[#C0392B]/30 rounded-xl px-4 py-3 text-[#C0392B] text-[12px] font-body">
                Error al enviar la cotización. Intentá nuevamente o contactanos directamente por WhatsApp.
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full flex items-center justify-center gap-2 bg-gold hover:bg-gold-dark disabled:opacity-60 text-dark font-heading font-bold py-4 rounded-2xl transition-colors duration-300 shadow-lg shadow-gold/20 text-[13px] tracking-wide"
            >
              {status === 'sending'
                ? <><Loader2 size={16} className="animate-spin" />Enviando...</>
                : <><Send size={14} />Enviar Cotización</>
              }
            </button>

            <p className="text-white/20 text-[11px] text-center font-body">
              Al enviar aceptás que un asesor se comunique con vos para completar la venta.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
