import { useEffect, useState, type FC } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/useAuthStore'
import type { AuthUser } from '../lib/auth'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password is required'),
  remember: z.boolean().optional(),
})

type LoginValues = z.infer<typeof schema>

const LoginPage: FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, token } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { remember: true },
  })

  useEffect(() => {
    if (token) {
      navigate('/dashboard/employees', { replace: true })
    }
  }, [token, navigate])

  const onSubmit = async (values: LoginValues) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post('/api/auth/login', {
        email: values.email,
        password: values.password,
      })
      console.log('Login response:', response.data)
      const token = response.data?.accessToken ?? response.data?.token
      const user = response.data?.user as AuthUser | undefined
      if (!token || !user) {
        throw new Error('Invalid login response')
      }
      login(token, user, values.remember)
      navigate('/dashboard/employees', { replace: true })
    } catch (err: any) {
      console.error('Login error', err)
      setError(
        err?.response?.data?.message ??
          'Login failed. Please check your credentials.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-emerald-100 p-6">
      <div className="mx-auto flex w-full max-w-5xl overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-2xl backdrop-blur">
        <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-emerald-600 via-emerald-500 to-sky-500 p-10 text-white lg:flex">
          <div>
            <div className="text-xl font-semibold tracking-wide">LinkUp Bio-Data</div>
            <p className="mt-3 text-sm text-emerald-50/80">
              Secure HR administration, streamlined staff onboarding, and premium
              employee data oversight.
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-xs text-emerald-50/90">
            “Manage with confidence — every profile, every site, every time.”
          </div>
        </div>

        <div className="flex w-full flex-col justify-center p-10 lg:w-1/2">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-800">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">
              Sign in to access the HR Admin workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Email
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-300"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Password
              </label>
              <div className="mt-2 flex items-center rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-emerald-300">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="flex-1 text-sm text-slate-700 outline-none"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-xs font-medium text-emerald-600"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register('remember')} />
                Remember me
              </label>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-500 disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
