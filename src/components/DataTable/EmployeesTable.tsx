import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type VisibilityState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { useCallback, useEffect, useMemo, useState, type FC } from 'react'
import { api } from '../../lib/api'
import type { ClearanceRole } from '../../lib/auth'
import { exportToCsv } from '../../lib/csv'
import EmployeeDrawer, { type SensitiveRecord } from '../Drawer/EmployeeDrawer'
import { buildColumns, sensitiveColumnIds, type EmployeeRecord } from './columns'
import Toolbar from './Toolbar'

type EmployeesTableProps = {
  data: EmployeeRecord[]
  loading: boolean
  error?: string | null
  role?: ClearanceRole
  onRefresh: () => void
}

const EmployeesTable: FC<EmployeesTableProps> = ({
  data,
  loading,
  error,
  role,
  onRefresh,
}) => {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    siteAndLocation: '',
    hiringStatus: '',
    maritalStatus: '',
    gender: '',
    stateOfOrigin: '',
    dateFrom: '',
    dateTo: '',
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({})
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeRecord | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sensitiveData, setSensitiveData] = useState<SensitiveRecord | null>(
    null,
  )
  const [preview, setPreview] = useState<{ label: string; url: string } | null>(
    null,
  )

  const handlePreview = useCallback((label: string, url: string) => {
    setPreview({ label, url })
  }, [])

  const columns = useMemo(
    () => buildColumns(role, handlePreview),
    [role, handlePreview],
  )

  useEffect(() => {
    const visibility: VisibilityState = {}
    if (role && role !== 'HR_ADMIN') {
      sensitiveColumnIds.forEach((id) => {
        visibility[id] = false
      })
    }
    setColumnVisibility((prev: VisibilityState) => ({ ...visibility, ...prev }))
  }, [role])

  const filterData = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return data.filter((row) => {
      if (filters.siteAndLocation && row.siteAndLocation !== filters.siteAndLocation) {
        return false
      }
      if (filters.hiringStatus && row.hiringStatus !== filters.hiringStatus) {
        return false
      }
      if (filters.maritalStatus && row.maritalStatus !== filters.maritalStatus) {
        return false
      }
      if (filters.gender && row.gender !== filters.gender) {
        return false
      }
      if (filters.stateOfOrigin && row.stateOfOrigin !== filters.stateOfOrigin) {
        return false
      }
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom)
        const date = row.employmentDate ? new Date(row.employmentDate) : null
        if (!date || date < from) return false
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo)
        const date = row.employmentDate ? new Date(row.employmentDate) : null
        if (!date || date > to) return false
      }
      if (!keyword) return true
      const haystack = [
        row.firstName,
        row.middleName,
        row.surname,
        row.phoneNumberStaff,
        row.phoneNumberNok,
        row.referenceCode,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(keyword)
    })
  }, [data, filters, search])

  const table = useReactTable({
    data: filterData,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  useEffect(() => {
    if (!drawerOpen || !selectedEmployee || role !== 'HR_ADMIN') {
      setSensitiveData(null)
      return
    }
    const reference = selectedEmployee.referenceCode
    if (!reference) return

    let cancelled = false
    const fetchWithRetry = async (attempts = 2) => {
      for (let i = 0; i < attempts; i++) {
        try {
          const response = await api.get(`/api/submissions/${reference}/sensitive`)
          if (!cancelled) setSensitiveData(response.data)
          return
        } catch (err: any) {
          const isLast = i === attempts - 1
          const isReset = err?.code === 'ECONNRESET' || err?.code === 'ERR_NETWORK'
          if (isLast || !isReset) {
            if (!cancelled) setSensitiveData(null)
            return
          }
          // short delay before retry
          await new Promise((r) => setTimeout(r, 1200))
        }
      }
    }
    fetchWithRetry()
    return () => { cancelled = true }
  }, [drawerOpen, selectedEmployee, role])

  const options = useMemo(() => {
    const unique = (list: (string | undefined)[]) =>
      Array.from(new Set(list.filter(Boolean) as string[])).sort()
    return {
      sites: unique(data.map((row) => row.siteAndLocation)),
      hiringStatuses: unique(data.map((row) => row.hiringStatus)),
      maritalStatuses: unique(data.map((row) => row.maritalStatus)),
      genders: unique(data.map((row) => row.gender)),
      states: unique(data.map((row) => row.stateOfOrigin)),
    }
  }, [data])

  const handleExport = () => {
    const visibleColumns = table.getVisibleLeafColumns()
    exportToCsv(
      `employees_${new Date().toISOString().slice(0, 10)}.csv`,
      filterData,
      visibleColumns.map((col) => ({
        header: String(col.columnDef.header ?? ''),
        accessor: (row) => {
          const accessorKey = (col as { accessorKey?: keyof EmployeeRecord })
            .accessorKey
          if (accessorKey) return row[accessorKey]
          return ''
        },
      })),
    )
  }

  const openDrawer = (employee: EmployeeRecord) => {
    setSelectedEmployee(employee)
    setDrawerOpen(true)
  }

  const visibleColumnCount = table.getVisibleLeafColumns().length

  return (
    <div className="space-y-6">
      <Toolbar
        search={search}
        onSearch={setSearch}
        filters={filters}
        onFilterChange={(key, value) =>
          setFilters((prev) => ({ ...prev, [key]: value }))
        }
        columnToggles={table.getAllLeafColumns()}
        onExport={handleExport}
        onRefresh={onRefresh}
        options={options}
      />

      <div className="rounded-2xl border border-white/60 bg-white/80 shadow-sm backdrop-blur">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-white/90">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-slate-200">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getIsSorted() === 'asc' && '↑'}
                        {header.column.getIsSorted() === 'desc' && '↓'}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-6 py-8 text-sm text-slate-500" colSpan={visibleColumnCount}>
                    Loading employee data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td className="px-6 py-8 text-sm text-rose-500" colSpan={visibleColumnCount}>
                    {error}
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td className="px-6 py-12 text-center text-sm text-slate-400" colSpan={visibleColumnCount}>
                    <div className="mx-auto max-w-md">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50">
                        <div className="h-6 w-8 rounded-md border border-emerald-200 bg-white" />
                      </div>
                      <div className="text-base font-semibold text-slate-500">
                        No employee records found
                      </div>
                      <div className="mt-2 text-sm text-slate-400">
                        Try adjusting your filters or search criteria.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100 hover:bg-emerald-50/60"
                    onClick={() => openDrawer(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm text-slate-600">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
          <div>
            Showing {table.getRowModel().rows.length} of {filterData.length} entries
          </div>
          <div className="flex items-center gap-3">
            <select
              value={table.getState().pagination.pageSize}
              onChange={(event) => table.setPageSize(Number(event.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <EmployeeDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        employee={selectedEmployee}
        sensitive={sensitiveData}
        role={role}
        onPreviewFile={handlePreview}
        onEditSuccess={onRefresh}
      />

      {preview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-700">{preview.label}</div>
              <button
                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500"
                onClick={() => setPreview(null)}
              >
                Close
              </button>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
              <img src={preview.url} alt={preview.label} className="h-auto w-full" />
            </div>
            <a
              href={preview.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700"
            >
              Download
            </a>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default EmployeesTable
