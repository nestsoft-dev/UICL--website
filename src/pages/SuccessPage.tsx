import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const STORAGE_KEY = 'bayelsa_biodata_submissions'

type SubmissionRecord = {
  ref: string
  submittedAt: string
  data: {
    surnameLastName?: string
    firstName?: string
    phoneNumberStaff?: string
    profession?: string
    preferredState?: string
  }
}

export default function SuccessPage() {
  const [params] = useSearchParams()
  const ref = params.get('ref') ?? ''

  const submission = useMemo(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as SubmissionRecord[]
      return parsed.find((item) => item.ref === ref) ?? null
    } catch {
      return null
    }
  }, [ref])

  const stateName = submission?.data.preferredState || 'Bayelsa'

  const handleExport = () => {
    if (!submission) return
    const blob = new Blob([JSON.stringify(submission, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${submission.ref}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white/95 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-2xl text-emerald-700">
            ✓
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Submission Received
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Thank you for completing the {stateName} Bio-Data Form.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600">
                Reference Code
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {ref || '—'}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/"
                className="rounded-xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                Back to Form
              </Link>
              <button
                onClick={handleExport}
                disabled={!submission}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Export JSON
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-slate-700 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Surname
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {submission?.data.surnameLastName || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                First Name
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {submission?.data.firstName || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Phone
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {submission?.data.phoneNumberStaff || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Designation
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {submission?.data.profession || '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
