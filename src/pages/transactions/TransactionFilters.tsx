import type { ChangeEvent } from 'react'
import { LayoutGroup } from 'framer-motion'

import { Button, Input, SegmentedControl, Select } from '@/shared/ui'

import { CATEGORY_VALUES, categoryLabel } from './categoryMeta'
import { DateRangePicker } from './DateRangePicker'
import styles from './TransactionFilters.module.css'

export type TypeFilter = 'all' | 'income' | 'expense'

export interface FiltersState {
  search: string
  type: TypeFilter
  /** Category value, '' means todas. */
  category: string
  /** `YYYY-MM-DD` from the date input, '' means sin límite. */
  from: string
  to: string
  page: number
}

export const INITIAL_FILTERS: FiltersState = {
  search: '',
  type: 'all',
  category: '',
  from: '',
  to: '',
  page: 1,
}

export function hasActiveFilters(filters: FiltersState): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.type !== 'all' ||
    filters.category !== '' ||
    filters.from !== '' ||
    filters.to !== ''
  )
}

export interface TransactionFiltersProps {
  filters: FiltersState
  onChange: (patch: Partial<FiltersState>) => void
  onClear: () => void
}

const TYPE_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'income', label: 'Ingresos' },
  { value: 'expense', label: 'Gastos' },
]

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

export function TransactionFilters({ filters, onChange, onClear }: TransactionFiltersProps) {
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) =>
    onChange({ search: event.target.value })
  const handleType = (value: string) => onChange({ type: value as TypeFilter })
  const handleCategory = (event: ChangeEvent<HTMLSelectElement>) =>
    onChange({ category: event.target.value })

  return (
    <div className={styles.toolbar} role="group" aria-label="Filtros de movimientos">
      <Input
        className={styles.search}
        type="search"
        aria-label="Buscar movimientos"
        placeholder="Buscar por título o categoría…"
        leftIcon={<SearchIcon />}
        value={filters.search}
        onChange={handleSearch}
      />
      <div className={styles.typeFilter} role="group" aria-label="Tipo de movimiento">
        {/* LayoutGroup evita que el thumb animado salte entre los dos SegmentedControl de la página. */}
        <LayoutGroup>
          <SegmentedControl options={TYPE_OPTIONS} value={filters.type} onChange={handleType} />
        </LayoutGroup>
      </div>
      <Select
        className={styles.select}
        aria-label="Categoría"
        value={filters.category}
        onChange={handleCategory}
      >
        <option value="">Todas</option>
        {CATEGORY_VALUES.map((category) => (
          <option key={category} value={category}>
            {categoryLabel(category)}
          </option>
        ))}
      </Select>
      <DateRangePicker from={filters.from} to={filters.to} onChange={onChange} />
      {hasActiveFilters(filters) && (
        <Button variant="ghost" size="sm" className={styles.clear} onClick={onClear}>
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}
