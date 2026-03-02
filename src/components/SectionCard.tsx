import type { ReactNode } from 'react'

interface SectionCardProps {
  title: string
  children: ReactNode
}

export default function SectionCard({ title, children }: SectionCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm md:p-7">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}
