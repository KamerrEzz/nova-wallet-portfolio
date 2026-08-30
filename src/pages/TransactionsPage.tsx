import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'

import { useGetTransactionsQuery } from '@/shared/api/apiSlice'
import type { TransactionsQuery } from '@/shared/api/apiSlice'
import { useDebounce } from '@/shared/hooks'
import type { Transaction } from '@/shared/types'
import { Button, EmptyState, ErrorState } from '@/shared/ui'

import { Pagination } from './transactions/Pagination'
import { TransactionDetailModal } from './transactions/TransactionDetailModal'
import { INITIAL_FILTERS, TransactionFilters, hasActiveFilters } from './transactions/TransactionFilters'
import type { FiltersState } from './transactions/TransactionFilters'
import { TransactionList, TransactionListSkeleton } from './transactions/TransactionList'
import styles from './transactions/TransactionsPage.module.css'

const PAGE_SIZE = 10

export default function TransactionsPage() {
  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS)
  const [selected, setSelected] = useState<Transaction | null>(null)
  const scrollAnchorRef = useRef<HTMLDivElement>(null)

  const debouncedSearch = useDebounce(filters.search, 350)

  /** Any filter change goes back to the first page. */
  const updateFilters = useCallback((patch: Partial<FiltersState>) => {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS)
  }, [])

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }, [])

  const handleSelect = useCallback((transaction: Transaction) => {
    setSelected(transaction)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setSelected(null)
  }, [])

  const queryArgs = useMemo<TransactionsQuery>(
    () => ({
      search: debouncedSearch.trim() || undefined,
      type: filters.type,
      category: filters.category || undefined,
      from: filters.from ? new Date(`${filters.from}T00:00:00`).toISOString() : undefined,
      to: filters.to ? new Date(`${filters.to}T23:59:59.999`).toISOString() : undefined,
      page: filters.page,
      pageSize: PAGE_SIZE,
    }),
    [debouncedSearch, filters.type, filters.category, filters.from, filters.to, filters.page],
  )

  const { data, isLoading, isFetching, isError, refetch } = useGetTransactionsQuery(queryArgs)

  // Bring the list back into view when the page changes.
  useEffect(() => {
    if (filters.page > 1) {
      scrollAnchorRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
    }
  }, [filters.page])

  const showSkeleton = data === undefined && (isLoading || isFetching)

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <header className={styles.header}>
        <h1 className={styles.title}>Movimientos</h1>
        <p className={styles.subtitle}>
          {data ? `${data.total} movimientos` : 'Cargando movimientos…'}
        </p>
      </header>

      <TransactionFilters filters={filters} onChange={updateFilters} onClear={clearFilters} />

      <div ref={scrollAnchorRef} className={styles.scrollAnchor} />

      {showSkeleton ? (
        <TransactionListSkeleton rows={10} />
      ) : isError || !data ? (
        <ErrorState
          title="No hemos podido cargar tus movimientos"
          onRetry={refetch}
        />
      ) : data.items.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          description="Prueba a ajustar los filtros"
          action={
            hasActiveFilters(filters) ? (
              <Button variant="ghost" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <TransactionList transactions={data.items} onSelect={handleSelect} />
      )}

      {data && data.totalPages > 1 && (
        <Pagination page={filters.page} totalPages={data.totalPages} onPageChange={setPage} />
      )}

      <TransactionDetailModal transaction={selected} onClose={handleCloseDetail} />
    </motion.div>
  )
}
