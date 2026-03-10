import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type PdfColumn<T> = {
  header: string
  accessor: (row: T) => string | number | null | undefined
}

type ExportPdfOptions = {
  title?: string
  orientation?: 'portrait' | 'landscape'
  format?: 'a4' | 'a3'
  fontSize?: number
}

export const exportToPdf = <T,>(
  filename: string,
  rows: T[],
  columns: PdfColumn<T>[],
  options: ExportPdfOptions = {},
) => {
  const doc = new jsPDF({
    orientation: options.orientation ?? 'landscape',
    unit: 'pt',
    format: options.format ?? 'a4',
  })

  const title = options.title?.trim()
  const margin = { top: title ? 60 : 40, left: 30, right: 30 }

  if (title) {
    doc.setFontSize(14)
    doc.setTextColor(15, 23, 42)
    doc.text(title, margin.left, 30)
  }

  const head = [columns.map((col) => col.header)]
  const body = rows.map((row) =>
    columns.map((col) => {
      const raw = col.accessor(row)
      if (raw === null || raw === undefined) return ''
      return String(raw)
    }),
  )

  autoTable(doc, {
    head,
    body,
    startY: margin.top,
    margin,
    styles: {
      fontSize: options.fontSize ?? 8,
      cellPadding: 3,
      textColor: [30, 41, 59],
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: 255,
      overflow: 'ellipsize',
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    tableWidth: 'auto',
  })

  doc.save(filename)
}
