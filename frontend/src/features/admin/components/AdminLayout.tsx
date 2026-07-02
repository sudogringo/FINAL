import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, Package, LogOut, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'
import { useAdmin } from '../AdminContext'

const NAV = [
  { to: '/admin',              icon: LayoutDashboard, label: 'Dashboard',    end: true  },
  { to: '/admin/cotizaciones', icon: FileText,         label: 'Cotizaciones', end: false },
  { to: '/admin/productos',    icon: Package,          label: 'Productos',    end: false },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { logout } = useAdmin()
  const navigate   = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() { logout(); navigate('/admin/login') }
  function closeMobile()  { setMobileOpen(false) }

  const sidebarContent = (mobile = false) => (
    <>
      {/* Header */}
      <div className={`border-b border-white/8 flex items-center justify-between ${collapsed && !mobile ? 'px-3 py-5' : 'px-5 py-6'}`}>
        {(!collapsed || mobile) && (
          <div>
            <span className="font-heading font-bold text-gold text-[15px] tracking-wider">Golden Harvest</span>
            <span className="block text-white/30 text-[11px] font-body mt-0.5">Panel Admin</span>
          </div>
        )}
        {mobile ? (
          <button onClick={closeMobile} className="text-white/30 hover:text-white/70 p-1.5 rounded-lg transition-colors ml-auto">
            <X size={18} />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(c => !c)}
            className={`text-white/30 hover:text-white/70 hover:bg-white/5 rounded-lg p-1.5 transition-colors ${collapsed ? 'mx-auto' : ''}`}
            title={collapsed ? 'Expandir' : 'Colapsar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={mobile ? closeMobile : undefined}
            title={collapsed && !mobile ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-body transition-colors ${
                collapsed && !mobile ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-gold/15 text-gold font-semibold'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`
            }
          >
            <Icon size={16} className="shrink-0" />
            {(!collapsed || mobile) && label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 py-4 border-t border-white/8">
        <button
          onClick={handleLogout}
          title={collapsed && !mobile ? 'Cerrar sesión' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-body text-white/30 hover:text-red-400 hover:bg-red-400/5 transition-colors ${
            collapsed && !mobile ? 'justify-center' : ''
          }`}
        >
          <LogOut size={16} className="shrink-0" />
          {(!collapsed || mobile) && 'Cerrar sesión'}
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#111008] flex">

      {/* Sidebar — desktop */}
      <aside
        className={`hidden md:flex shrink-0 bg-[#1a1610] border-r border-white/8 flex-col transition-all duration-300 ${
          collapsed ? 'w-[60px]' : 'w-56'
        }`}
      >
        {sidebarContent(false)}
      </aside>

      {/* Sidebar — mobile overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={closeMobile}
          />
          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 z-50 w-56 bg-[#1a1610] border-r border-white/8 flex flex-col md:hidden">
            {sidebarContent(true)}
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/8 bg-[#1a1610]">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-white/40 hover:text-white/70 p-1.5 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="font-heading font-bold text-gold text-[14px] tracking-wider">Golden Harvest</span>
        </div>
        {children}
      </main>
    </div>
  )
}
