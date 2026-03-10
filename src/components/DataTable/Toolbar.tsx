import type { Column } from '@tanstack/react-table'
import { type FC } from 'react'

type ToolbarProps = {
  search: string
  onSearch: (value: string) => void
  filters: {
    siteAndLocation: string
    hiringStatus: string
    maritalStatus: string
    gender: string
    stateOfOrigin: string
    dateFrom: string
    dateTo: string
  }
  onFilterChange: (key: keyof ToolbarProps['filters'], value: string) => void
  columnToggles: Column<any, unknown>[]
  onExport: () => void
  onRefresh: () => void
  options: {
    sites: string[]
    hiringStatuses: string[]
    maritalStatuses: string[]
    genders: string[]
    states: string[]
  }
}

const SelectField: FC<{
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}> = ({ label, value, options, onChange }) => (
  <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
    {label}
    <select
      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-300"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">All</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
)

const Toolbar: FC<ToolbarProps> = ({
  search,
  onSearch,
  filters,
  onFilterChange,
  columnToggles,
  onExport,
  onRefresh,
  options,
}) => {
  return (
    <div className="space-y-4 rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
              Search employees
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-300"
                placeholder="Search by name, phone, or reference code"
                value={search}
                onChange={(event) => onSearch(event.target.value)}
              />
            </label>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={onExport}
              className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm transition hover:bg-emerald-100"
            >
              Export PDF
            </button>
            <button
              onClick={onRefresh}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
            Columns
          </div>
          <div className="flex flex-wrap gap-2">
            {columnToggles.map((column) => (
              <label
                key={column.id}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={column.getIsVisible()}
                  onChange={column.getToggleVisibilityHandler()}
                />
                {String(column.columnDef.header)}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <SelectField
          label="Site & Location"
          value={filters.siteAndLocation}
          options={options.sites}
          onChange={(value) => onFilterChange('siteAndLocation', value)}
        />
        <SelectField
          label="Hiring Status"
          value={filters.hiringStatus}
          options={options.hiringStatuses}
          onChange={(value) => onFilterChange('hiringStatus', value)}
        />
        <SelectField
          label="Marital Status"
          value={filters.maritalStatus}
          options={options.maritalStatuses}
          onChange={(value) => onFilterChange('maritalStatus', value)}
        />
        <SelectField
          label="Gender"
          value={filters.gender}
          options={options.genders}
          onChange={(value) => onFilterChange('gender', value)}
        />
        <SelectField
          label="State of Origin"
          value={filters.stateOfOrigin}
          options={options.states}
          onChange={(value) => onFilterChange('stateOfOrigin', value)}
        />
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
          Employment Date
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-300"
              value={filters.dateFrom}
              onChange={(event) => onFilterChange('dateFrom', event.target.value)}
            />
            <input
              type="date"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-300"
              value={filters.dateTo}
              onChange={(event) => onFilterChange('dateTo', event.target.value)}
            />
          </div>
        </label>
      </div>
    </div>
  )
}

export default Toolbar
