import { type FC } from 'react'

const UnauthorizedPage: FC = () => (
  <div className="rounded-2xl border border-white/60 bg-white/80 p-8 text-sm text-slate-600 shadow-sm">
    <div className="text-lg font-semibold text-slate-700">Access Restricted</div>
    <p className="mt-2 text-sm text-slate-500">
      You do not have permission to view this section. Please contact an HR
      administrator if you need access.
    </p>
  </div>
)

export default UnauthorizedPage
