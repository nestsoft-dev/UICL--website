type CsvColumn<T> = {
  header: string
  accessor: (row: T) => string | number | null | undefined
}

const escapeCsv = (value: string) => {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

export const exportToCsv = <T,>(
  filename: string,
  rows: T[],
  columns: CsvColumn<T>[],
) => {
  const headers = columns.map((col) => escapeCsv(col.header)).join(',')
  const body = rows
    .map((row) =>
      columns
        .map((col) => {
          const raw = col.accessor(row)
          if (raw === null || raw === undefined) return ''
          return escapeCsv(String(raw))
        })
        .join(','),
    )
    .join('\n')

  const csv = `${headers}\n${body}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
