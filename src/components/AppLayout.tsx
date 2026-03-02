import { type FC } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import RoleGate from './RoleGate'

const RoleBadge: FC<{ role: string }> = ({ role }) => {
  const colors: Record<string, string> = {
    HR_ADMIN: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    SITE_SUPERVISOR: 'bg-sky-100 text-sky-700 border-sky-200',
    DATA_ENTRY: 'bg-amber-100 text-amber-700 border-amber-200',
    VIEWER: 'bg-slate-100 text-slate-700 border-slate-200',
  }
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${colors[role] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}
    >
      {role.replace('_', ' ')}
    </span>
  )
}

const AppLayout: FC = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-emerald-50">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-white/40 bg-white/80 px-6 py-8 shadow-sm backdrop-blur lg:flex">
          <div className="mb-10">
            <div className="text-lg font-semibold tracking-wide text-emerald-700">
              UICL Bio-Data
            </div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              HR Admin Suite
            </div>
          </div>
          <nav className="space-y-2 text-sm font-medium text-slate-600">
            <NavLink
              to="/dashboard/employees"
              className={({ isActive }) =>
                `flex items-center rounded-xl px-4 py-3 transition ${isActive ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-slate-100'}`
              }
            >
              Employees
            </NavLink>
            {/* staff registration is restricted to HR admin only */}
            <RoleGate allow={["HR_ADMIN"]}>
              <NavLink
                to="/dashboard/staff/register"
                className={({ isActive }) =>
                  `flex items-center rounded-xl px-4 py-3 transition ${isActive ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-slate-100'}`
                }
              >
                Staff Register
              </NavLink>
            </RoleGate>
            {/* data entry form should be available to HR admins and data entry users */}
            <RoleGate allow={["HR_ADMIN", "DATA_ENTRY"]}>
              <NavLink
                to="/dashboard/entry"
                className={({ isActive }) =>
                  `flex items-center rounded-xl px-4 py-3 transition ${isActive ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-slate-100'}`
                }
              >
                Data Entry
              </NavLink>
            </RoleGate>
          </nav>
          <div className="mt-auto rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-xs text-emerald-700">
            Secure employee bio-data management.
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/40 bg-white/70 px-6 py-4 backdrop-blur">
            <div>
              <div className="text-lg font-semibold text-slate-800">
                Welcome back{user?.fullName ? `, ${user.fullName}` : ''}
              </div>
              <div className="text-xs text-slate-500">
                Manage staff data and submissions
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user?.role && <RoleBadge role={user.role} />}
              <button
                onClick={handleLogout}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </header>
          <main className="flex-1 px-6 py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default AppLayout
