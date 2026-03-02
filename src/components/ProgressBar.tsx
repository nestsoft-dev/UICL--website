interface ProgressBarProps {
  progress: number
  stepText: string
}

export default function ProgressBar({ progress, stepText }: ProgressBarProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="flex items-center justify-between text-xs font-medium text-slate-600">
        <span>{stepText}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-emerald-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
