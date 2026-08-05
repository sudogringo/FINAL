import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, CheckCircle2, Clock, TrendingUp, BarChart2 } from 'lucide-react'
import { useAdmin } from '../../features/admin/AdminContext'
import { fetchMonthlyStats, type MonthlyStats } from '../../features/admin/api'
import AdminLayout from '../../features/admin/components/AdminLayout'

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: typeof FileText; label: string; value: number | string; sub?: string; color: string
}) {
  return (
    <div className="bg-[#1a1610] border border-white/8 rounded-2xl p-6 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-white/35 text-[11px] font-heading font-semibold tracking-widest uppercase">{label}</p>
        <p className="text-white font-heading font-bold text-3xl mt-1">{value}</p>
        {sub && <p className="text-white/30 text-[12px] font-body mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const { token, isAuthenticated } = useAdmin()
  const navigate = useNavigate()
  const [stats,   setStats]   = useState<MonthlyStats | null>(null)
  const [loading, setLoading] = useState(true)

  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthLabel   = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  useEffect(() => {
    if (!isAuthenticated) { navigate('/admin/login'); return }
    fetchMonthlyStats(token!, currentMonth)
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-white font-heading font-bold text-2xl">Dashboard</h1>
          <p className="text-white/30 text-[13px] font-body mt-1 capitalize">{monthLabel}</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-36 rounded-2xl bg-white/5 animate-pulse" />)}
          </div>
        ) : stats ? (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={FileText}
                label="Leads recibidos"
                value={stats.quotes.total}
                sub="este mes"
                color="bg-gold/15 text-gold"
              />
              <StatCard
                icon={Clock}
                label="Pendientes"
                value={stats.quotes.pending}
                sub="sin contactar"
                color="bg-yellow-500/15 text-yellow-300"
              />
              <StatCard
                icon={CheckCircle2}
                label="Pedidos cerrados"
                value={stats.quotes.closed}
                sub="órdenes generadas"
                color="bg-green-500/15 text-green-300"
              />
              <StatCard
                icon={TrendingUp}
                label="En seguimiento"
                value={stats.quotes.contacted}
                sub="contactados"
                color="bg-blue-500/15 text-blue-300"
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top productos */}
              <div className="bg-[#1a1610] border border-white/8 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart2 size={16} className="text-gold" />
                  <h2 className="text-white font-heading font-semibold text-[14px]">Productos más solicitados</h2>
                </div>
                {stats.topProducts.length === 0 ? (
                  <p className="text-white/25 text-[13px] font-body">Sin datos aún este mes</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {stats.topProducts.map((p, i) => (
                      <div key={p.nombre} className="flex items-center gap-3">
                        <span className="text-white/20 font-heading font-bold text-[11px] w-4">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-white/70 text-[13px] font-body">{p.nombre}</span>
                            <span className="text-gold/60 text-[12px] font-heading font-bold">{p.units} u.</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gold/50 rounded-full"
                              style={{ width: `${Math.min(100, (p.units / (stats.topProducts[0]?.units || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Interacciones web */}
              <div className="bg-[#1a1610] border border-white/8 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp size={16} className="text-gold" />
                  <h2 className="text-white font-heading font-semibold text-[14px]">Actividad web este mes</h2>
                </div>
                {stats.webInteractions.length === 0 ? (
                  <p className="text-white/25 text-[13px] font-body">Sin interacciones registradas aún</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {stats.webInteractions.map(i => (
                      <div key={i.tipo} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-gold/50" />
                          <span className="text-white/60 text-[13px] font-body capitalize">{i.tipo}s de producto</span>
                        </div>
                        <span className="text-white font-heading font-bold text-[16px]">{i.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="text-white/30 text-[13px] font-body">Error al cargar las métricas</p>
        )}
      </div>
    </AdminLayout>
  )
}
