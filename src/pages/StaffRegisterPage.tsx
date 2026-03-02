import { useMemo, useState, type FC } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '../lib/api'
const roleOptions = ['HR_ADMIN', 'SITE_SUPERVISOR', 'DATA_ENTRY', 'VIEWER'] as const

const schema = z
  .object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Enter a valid email address'),
    role: z.enum(roleOptions),
    siteId: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
    }
    if (values.role !== 'HR_ADMIN' && !values.siteId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Site ID is required for this role',
        path: ['siteId'],
      })
    }
  })

type RegisterValues = z.infer<typeof schema>

const mockRecentUsers = [
  { name: 'Amina Yusuf', role: 'SITE_SUPERVISOR', email: 'amina@company.com' },
  { name: 'Chinedu Okafor', role: 'DATA_ENTRY', email: 'chinedu@company.com' },
  { name: 'Lara Bamidele', role: 'VIEWER', email: 'lara@company.com' },
]

const StaffRegisterPage: FC = () => {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'SITE_SUPERVISOR' },
  })

  const selectedRole = watch('role')

  const passwordHint = useMemo(() => {
    return 'Use at least 8 characters with a mix of letters and numbers.'
  }, [])

  const onSubmit = async (values: RegisterValues) => {
    setLoading(true)
    setSuccess(null)
    setError(null)
    try {
      await api.post('/api/auth/register', {
        fullName: values.fullName,
        email: values.email,
        role: values.role,
        siteId: values.role === 'HR_ADMIN' ? undefined : values.siteId,
        password: values.password,
      })
      setSuccess('Staff account created successfully.')
      reset()
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          'Unable to create staff account. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Create Staff Account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Provision HR, supervisors, and data entry accounts with defined clearance.
        </p>
      </div>

      <div className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-emerald-100 text-center text-sm font-semibold text-emerald-700">
            <span className="leading-10">1</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-700">
              Create Staff Account
            </div>
            <div className="text-xs text-slate-400">
              Enter staff details and assign clearance.
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Full Name
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-300"
              {...register('fullName')}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-rose-500">{errors.fullName.message}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Email
            </label>
            <input
              type="email"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-300"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Role
            </label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-300"
              {...register('role')}
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          {selectedRole !== 'HR_ADMIN' && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Site ID
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-300"
                {...register('siteId')}
              />
              {errors.siteId && (
                <p className="mt-1 text-xs text-rose-500">{errors.siteId.message}</p>
              )}
            </div>
          )}
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Password
            </label>
            <input
              type="password"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-300"
              {...register('password')}
            />
            <p className="mt-1 text-xs text-slate-400">{passwordHint}</p>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Confirm Password
            </label>
            <input
              type="password"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-300"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            {success && (
              <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-600">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-600">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-500 disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create Staff Account'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-white/60 bg-white/80 p-6 shadow-sm">
        <div className="mb-4 text-sm font-semibold text-slate-700">
          Recently created users
        </div>
        <div className="space-y-3 text-sm text-slate-600">
          {mockRecentUsers.map((user) => (
            <div
              key={user.email}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3"
            >
              <div>
                <div className="font-medium text-slate-700">{user.name}</div>
                <div className="text-xs text-slate-400">{user.email}</div>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                {user.role.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StaffRegisterPage
