import { useGetTransactionsQuery } from '@/shared/api/apiSlice'
import { cn } from '@/shared/lib/cn'
import { formatCurrency, formatRelativeDate } from '@/shared/lib/format'
import { Badge, EmptyState, ErrorState, Skeleton } from '@/shared/ui'

import styles from './transfers.module.css'

const HISTORY_QUERY = { category: 'transferencias', page: 1, pageSize: 20 } as const

/** Historial — transferencias pasadas (movimientos con categoría `transferencias`). */
export function TransferHistory() {
  const { data, isLoading, isError, refetch } = useGetTransactionsQuery(HISTORY_QUERY)

  if (isLoading) {
    return (
      <div aria-busy="true" aria-label="Cargando historial de transferencias">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className={styles.skeletonRow}>
            <div className={styles.skeletonLines}>
              <Skeleton width="55%" height={14} />
              <Skeleton width="35%" height={12} />
            </div>
            <Skeleton width={72} height={16} />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <ErrorState
        title="No hemos podido cargar tu historial"
        description="Inténtalo de nuevo en unos segundos."
        onRetry={refetch}
      />
    )
  }

  const transfers = data?.items ?? []

  if (transfers.length === 0) {
    return (
      <EmptyState
        title="Aún no has hecho transferencias"
        description="Cuando envíes dinero, tus transferencias aparecerán aquí."
      />
    )
  }

  return (
    <ul className={styles.historyList} aria-label="Historial de transferencias">
      {transfers.map((tx) => (
        <li key={tx.id} className={styles.historyRow}>
          <span className={styles.historyInfo}>
            <span className={styles.historyTitle}>{tx.counterparty ?? tx.title}</span>
            <span className={styles.historyMeta}>
              {formatRelativeDate(tx.date)}
              {tx.status !== 'completed' && (
                <>
                  {' · '}
                  <Badge variant={tx.status === 'failed' ? 'danger' : 'accent'}>
                    {tx.status === 'failed' ? 'Fallida' : 'Pendiente'}
                  </Badge>
                </>
              )}
            </span>
          </span>
          <span
            className={cn(styles.historyAmount, tx.amount < 0 ? styles.out : styles.in)}
            aria-label={`Importe: ${formatCurrency(tx.amount, tx.currency)}`}
          >
            {formatCurrency(tx.amount, tx.currency)}
          </span>
        </li>
      ))}
    </ul>
  )
}
