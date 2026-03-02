import { useEffect, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/useAuthStore'

const LogoutPage: FC = () => {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  useEffect(() => {
    const run = async () => {
      try {
        await api.post('/api/auth/logout')
      } catch {
        // ignore logout errors
      } finally {
        logout()
        navigate('/login', { replace: true })
      }
    }
    run()
  }, [logout, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-sky-50 to-emerald-100">
      <div className="rounded-2xl border border-white/60 bg-white/80 px-6 py-4 text-sm text-slate-500 shadow-sm">
        Signing you out...
      </div>
    </div>
  )
}

export default LogoutPage
