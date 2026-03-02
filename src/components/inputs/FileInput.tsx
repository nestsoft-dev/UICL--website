import type { ChangeEvent } from 'react'
import { baseInputClass } from './inputStyles'

export type FileValue = {
  name: string
  type: string
  size: number
  base64: string
}

interface FileInputProps {
  id?: string
  accept?: string
  value: FileValue | null
  onChange: (value: FileValue | null) => void
}

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
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
      const base64 = await toBase64(file)
      onChange({
        name: file.name,
        type: file.type,
        size: file.size,
        base64,
      })
    } catch {
      onChange(null)
    }
  }

  return (
    <div className="space-y-2">
      <input
        id={id}
        type="file"
        accept={accept}
        onChange={handleChange}
        className={`${baseInputClass} file:mr-3 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-emerald-700 hover:file:bg-emerald-100`}
      />
      {value?.name && (
        <p className="text-xs text-slate-500">Selected: {value.name}</p>
      )}
    </div>
  )
}
