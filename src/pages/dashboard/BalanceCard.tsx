import { useGetBalanceQuery } from '@/shared/api/apiSlice'
import { formatCurrency } from '@/shared/lib/format'
import { Badge, Card, ErrorState, Skeleton } from '@/shared/ui'

import styles from './BalanceCard.module.css'

export function BalanceCard() {
  const { data, isLoading, isError, refetch } = useGetBalanceQuery()

  if (isLoading) {
    return (
      <Card glass padding="lg" className={styles.card} aria-busy="true">
        <div className={styles.stack}>
          <Skeleton width="36%" height={14} />
          <Skeleton width="68%" height={44} borderRadius={12} />
          <Skeleton width="28%" height={24} borderRadius={999} />
        </div>
      </Card>
    )
  }

  if (isError || !data) {
    return (
      <Card glass padding="lg" className={styles.card}>
        <ErrorState
          title="No hemos podido cargar tu balance"
          description="Inténtalo de nuevo en unos segundos."
          onRetry={refetch}
        />
      </Card>
    )
  }

  const positive = data.monthlyChangePct >= 0

  return (
    <Card glass padding="lg" className={styles.card}>
      <div className={styles.stack}>
        <span className={styles.label}>Balance total</span>
        <span className={styles.amount}>{formatCurrency(data.total, data.currency)}</span>
        <div>
          <Badge variant={positive ? 'success' : 'danger'}>
            <span aria-hidden="true">{positive ? '▲' : '▼'}</span>
            {Math.abs(data.monthlyChangePct)}% este mes
          </Badge>
        </div>
      </div>
    </Card>
  )
}
