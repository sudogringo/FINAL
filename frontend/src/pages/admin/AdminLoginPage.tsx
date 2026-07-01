import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../../features/admin/AdminContext'
import { adminLogin } from '../../features/admin/api'

export default function AdminLoginPage() {
  const { login } = useAdmin()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const token = await adminLogin(email, password)
      login(token)
      navigate('/admin/productos')
    } catch {
      setError('Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-gold font-heading font-bold text-2xl">Golden Harvest</h1>
          <p className="text-white/40 text-sm font-body mt-1">Panel de administración</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#1a1610] border border-white/8 rounded-2xl p-6 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-white/60 text-xs font-body">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-body focus:outline-none focus:border-gold/50"
              placeholder="admin@goldenharvest.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-white/60 text-xs font-body">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-body focus:outline-none focus:border-gold/50"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs font-body">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-gold hover:bg-gold-dark text-dark font-heading font-bold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
