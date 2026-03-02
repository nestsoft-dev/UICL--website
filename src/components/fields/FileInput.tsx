import type { ChangeEvent } from 'react'

export type FileValue = {
  name: string
  type: string
  size: number
  base64: string
  file: File
}

interface FileInputProps {
  id?: string
  accept?: string
  value: FileValue | null
  onChange: (value: FileValue | null) => void
}

const compressImage = (
  file: File,
  maxWidth = 800,
  quality = 0.7,
): Promise<{ base64: string; blob: Blob }> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas not supported'))
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const base64 = canvas.toDataURL('image/jpeg', quality)
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Failed to compress image'))
          resolve({ base64, blob })
        },
        'image/jpeg',
        quality,
      )
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = url
  })

export default function FileInput({
  id,
  accept,
  value,
  onChange,
}: FileInputProps) {
  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      onChange(null)
      return
    }

    try {
      const { base64, blob } = await compressImage(file)
      const compressed = new File([blob], file.name, { type: 'image/jpeg' })
      onChange({
        name: file.name,
        type: 'image/jpeg',
        size: compressed.size,
        base64,
        file: compressed,
      })
    } catch {
      onChange(null)
    }
  }

  return (
    <div className="space-y-3">
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 px-4 py-3 text-sm text-slate-600 transition hover:bg-emerald-50"
      >
        <div>
          <p className="font-medium text-slate-700">Upload file</p>
          <p className="text-xs text-slate-500">JPG/PNG • Max 1MB</p>
        </div>
        <span className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
          Browse
        </span>
      </label>
      <input
        id={id}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="sr-only"
      />

      {value && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <div className="h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <img
              src={value.base64}
              alt={value.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="text-xs text-slate-600">
            <p className="font-semibold text-slate-700">{value.name}</p>
            <p>{Math.round(value.size / 1024)} KB</p>
          </div>
        </div>
      )}
    </div>
  )
}
