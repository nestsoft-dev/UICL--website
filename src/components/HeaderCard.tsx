interface HeaderCardProps {
  preferredState: string
  onStateChange: (value: string) => void
  states: string[]
  error?: string
}

export default function HeaderCard({
  preferredState,
  onStateChange,
  states,
  error,
}: HeaderCardProps) {
  return (
    <div className="sticky top-4 z-10 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-xs font-semibold text-emerald-700">
            LinkUp
          </div>
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold text-emerald-700">
              LinkUp Human Capital Limited
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900 md:text-3xl">
              {preferredState || 'LinkUp'} BIO-DATA FORM
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Complete this form to onboard as staff.
            </p>
          </div>
        </div>

        <div className="w-full md:w-56">
          <label className="text-sm font-medium text-slate-700">
            Site/Location
            <span className="ml-1 text-rose-500" title="Required">
              *
            </span>
          </label>
          <select
            value={preferredState}
            onChange={(event) => onStateChange(event.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            aria-invalid={!!error}
          >
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
        </div>
      </div>
    </div>
  )
}
