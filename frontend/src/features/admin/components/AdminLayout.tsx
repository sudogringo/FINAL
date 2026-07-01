import { type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, Package, LogOut } from 'lucide-react'
import { useAdmin } from '../AdminContext'

const NAV = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard',     end: true },
  { to: '/admin/cotizaciones', icon: FileText,       label: 'Cotizaciones',  end: false },
  { to: '/admin/productos',  icon: Package,          label: 'Productos',     end: false },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { logout } = useAdmin()
  const navigate   = useNavigate()

  function handleLogout() { logout(); navigate('/admin/login') }

  return (
    <div className="min-h-screen bg-[#111008] flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-[#1a1610] border-r border-white/8 flex flex-col">
        <div className="px-6 py-6 border-b border-white/8">
          <span className="font-heading font-bold text-gold text-[15px] tracking-wider">Golden Harvest</span>
          <span className="block text-white/30 text-[11px] font-body mt-0.5">Panel Admin</span>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-body transition-colors ${
                  isActive
                    ? 'bg-gold/15 text-gold font-semibold'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-body text-white/30 hover:text-red-400 hover:bg-red-400/5 transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
