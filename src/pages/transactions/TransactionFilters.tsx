import type { ChangeEvent } from 'react'

import { Button, Input, Select } from '@/shared/ui'

import { CATEGORY_VALUES, categoryLabel } from './categoryMeta'
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
  const handleType = (event: ChangeEvent<HTMLSelectElement>) =>
    onChange({ type: event.target.value as TypeFilter })
  const handleCategory = (event: ChangeEvent<HTMLSelectElement>) =>
    onChange({ category: event.target.value })
  const handleFrom = (event: ChangeEvent<HTMLInputElement>) => onChange({ from: event.target.value })
  const handleTo = (event: ChangeEvent<HTMLInputElement>) => onChange({ to: event.target.value })

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
      <Select
        className={styles.select}
        aria-label="Tipo de movimiento"
        value={filters.type}
        onChange={handleType}
      >
        <option value="all">Todos</option>
        <option value="income">Ingresos</option>
        <option value="expense">Gastos</option>
      </Select>
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
      <Input
        className={styles.date}
        type="date"
        label="Desde"
        value={filters.from}
        max={filters.to || undefined}
        onChange={handleFrom}
      />
      <Input
        className={styles.date}
        type="date"
        label="Hasta"
        value={filters.to}
        min={filters.from || undefined}
        onChange={handleTo}
      />
      {hasActiveFilters(filters) && (
        <Button variant="ghost" size="sm" className={styles.clear} onClick={onClear}>
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}
