import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { useAdmin } from '../../features/admin/AdminContext'
import { fetchQuotes, updateQuoteStatus, type ApiQuote, type QuoteStatus } from '../../features/admin/api'
import AdminLayout from '../../features/admin/components/AdminLayout'

const STATUS_LABEL: Record<QuoteStatus, string> = {
  PENDING:   'Pendiente',
  CONTACTED: 'Contactado',
  CLOSED:    'Cerrado',
}
const STATUS_COLOR: Record<QuoteStatus, string> = {
  PENDING:   'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  CONTACTED: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  CLOSED:    'bg-green-500/15 text-green-300 border-green-500/30',
}
const NEXT_STATUS: Record<QuoteStatus, QuoteStatus | null> = {
  PENDING:   'CONTACTED',
  CONTACTED: 'CLOSED',
  CLOSED:    null,
}
const NEXT_LABEL: Record<QuoteStatus, string> = {
  PENDING:   'Marcar Contactado',
  CONTACTED: 'Cerrar Pedido',
  CLOSED:    '',
}

export default function AdminQuotesPage() {
  const { token, isAuthenticated } = useAdmin()
  const navigate = useNavigate()

  const [quotes,   setQuotes]   = useState<ApiQuote[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [filter,   setFilter]   = useState<QuoteStatus | 'ALL'>('ALL')

  useEffect(() => {
    if (!isAuthenticated) { navigate('/admin/login'); return }
    load()
  }, [isAuthenticated])

  async function load() {
    setLoading(true); setError('')
    try   { setQuotes(await fetchQuotes(token!)) }
    catch { setError('No se pudieron cargar las cotizaciones') }
    finally { setLoading(false) }
  }

  async function handleStatus(quote: ApiQuote) {
    const next = NEXT_STATUS[quote.status]
    if (!next) return
    if (next === 'CLOSED' && !window.confirm(`¿Cerrar el pedido de ${quote.contact.nombre}?\nEsto descuenta stock y genera la orden.`)) return
    setUpdating(quote.id)
    try {
      const updated = await updateQuoteStatus(token!, quote.id, next)
      setQuotes(prev => prev.map(q => q.id === updated.id ? { ...q, status: updated.status } : q))
    } catch {
      alert('Error al actualizar el estado')
    } finally {
      setUpdating(null)
    }
  }

  const visible = filter === 'ALL' ? quotes : quotes.filter(q => q.status === filter)

  const counts = {
    ALL:       quotes.length,
    PENDING:   quotes.filter(q => q.status === 'PENDING').length,
    CONTACTED: quotes.filter(q => q.status === 'CONTACTED').length,
    CLOSED:    quotes.filter(q => q.status === 'CLOSED').length,
  }

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white font-heading font-bold text-2xl">Cotizaciones</h1>
            <p className="text-white/30 text-[13px] font-body mt-1">{quotes.length} solicitudes en total</p>
          </div>
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-[13px] font-body transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          {(['ALL', 'PENDING', 'CONTACTED', 'CLOSED'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-heading font-semibold transition-colors border ${
                filter === f
                  ? 'bg-gold/20 text-gold border-gold/40'
                  : 'bg-white/5 text-white/40 border-white/10 hover:text-white/70'
              }`}
            >
              {f === 'ALL' ? 'Todas' : STATUS_LABEL[f]} ({counts[f]})
            </button>
          ))}
        </div>

        {error && <p className="text-red-400 text-[13px] mb-4">{error}</p>}

        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-20 text-white/25 font-body text-[14px]">
            No hay cotizaciones {filter !== 'ALL' && `con estado "${STATUS_LABEL[filter as QuoteStatus]}"`}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map(q => {
              const isOpen = expanded === q.id
              const next   = NEXT_STATUS[q.status]
              return (
                <div key={q.id} className="bg-[#1a1610] border border-white/8 rounded-2xl overflow-hidden">
                  {/* Row */}
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* Status badge */}
                    <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-heading font-bold border ${STATUS_COLOR[q.status]}`}>
                      {STATUS_LABEL[q.status]}
                    </span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-heading font-semibold text-[14px] truncate">{q.contact.nombre}</p>
                      <p className="text-white/35 text-[12px] font-body truncate">
                        {q.contact.email}{q.contact.empresa ? ` · ${q.contact.empresa}` : ''}{q.contact.telefono ? ` · ${q.contact.telefono}` : ''}
                      </p>
                    </div>

                    {/* Items count + date */}
                    <div className="shrink-0 text-right">
                      <p className="text-white/50 text-[12px] font-body">{q.items.length} producto{q.items.length !== 1 ? 's' : ''}</p>
                      <p className="text-white/25 text-[11px] font-body">{new Date(q.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>

                    {/* Action button */}
                    {next && (
                      <button
                        disabled={updating === q.id}
                        onClick={() => handleStatus(q)}
                        className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-heading font-bold transition-colors disabled:opacity-50 ${
                          next === 'CLOSED'
                            ? 'bg-green-500/15 text-green-300 hover:bg-green-500/25 border border-green-500/30'
                            : 'bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 border border-blue-500/30'
                        }`}
                      >
                        {updating === q.id ? '...' : NEXT_LABEL[q.status]}
                      </button>
                    )}

                    {/* Expand */}
                    <button
                      onClick={() => setExpanded(isOpen ? null : q.id)}
                      className="shrink-0 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="border-t border-white/8 px-5 py-4 bg-white/2">
                      <div className="grid sm:grid-cols-2 gap-6">
                        {/* Productos */}
                        <div>
                          <p className="text-white/25 text-[10px] font-heading font-bold tracking-widest uppercase mb-3">Productos solicitados</p>
                          <div className="flex flex-col gap-2">
                            {q.items.map((item, i) => (
                              <div key={i} className="flex justify-between items-center">
                                <span className="text-white/60 text-[13px] font-body">{item.name} — {item.size}</span>
                                <span className="text-gold/60 text-[13px] font-heading font-bold">×{item.qty}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Contacto */}
                        <div>
                          <p className="text-white/25 text-[10px] font-heading font-bold tracking-widest uppercase mb-3">Datos de contacto</p>
                          <div className="flex flex-col gap-1.5 text-[13px] font-body">
                            {[
                              ['Nombre',   q.contact.nombre],
                              ['Email',    q.contact.email],
                              ['Teléfono', q.contact.telefono],
                              ['Empresa',  q.contact.empresa],
                              ['Notas',    q.contact.notas],
                            ].filter(([, v]) => v).map(([label, value]) => (
                              <div key={label} className="flex gap-2">
                                <span className="text-white/25 w-16 shrink-0">{label}</span>
                                <span className="text-white/70">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
