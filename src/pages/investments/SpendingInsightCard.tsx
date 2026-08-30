import { useMemo } from 'react'

import { useGetSpendingInsightQuery } from '@/shared/api/apiSlice'
import { formatCurrency } from '@/shared/lib/format'
import { Badge, Card, EmptyState, ErrorState, Progress, Skeleton } from '@/shared/ui'

import styles from './SpendingInsightCard.module.css'

const MAX_CATEGORIES = 5

/** "2026-08" → "agosto de 2026" */
function formatPeriod(period: string): string {
  const date = new Date(`${period}-02T00:00:00`)
  if (Number.isNaN(date.getTime())) return period
  const label = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function SpendingInsightCard() {
  const { data, isLoading, isError, refetch } = useGetSpendingInsightQuery()

  const categories = useMemo(() => {
    if (!data) return []
    return Object.entries(data.byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_CATEGORIES)
  }, [data])

  const maxCategory = categories.length > 0 ? categories[0][1] : 1

  let content
  if (isLoading) {
    content = (
      <div className={styles.skeletonWrap} aria-busy="true">
        <Skeleton width="45%" height={36} borderRadius={8} />
        <Skeleton width="100%" height={120} borderRadius={12} />
      </div>
    )
  } else if (isError || !data) {
    content = <ErrorState title="No hemos podido cargar tus insights" onRetry={refetch} />
  } else if (categories.length === 0) {
    content = (
      <EmptyState
        title="Sin gastos este mes"
        description="Cuando registres gastos, aquí verás en qué se va tu dinero."
      />
    )
  } else {
    const moreSpending = data.vsPreviousPeriodPct > 0
    content = (
      <>
        <div className={styles.summary}>
          <div className={styles.totalBlock}>
            <span className={styles.period}>{formatPeriod(data.period)}</span>
            <span className={styles.total}>{formatCurrency(data.totalSpent)}</span>
          </div>
          <Badge variant={moreSpending ? 'danger' : 'success'}>
            {data.vsPreviousPeriodPct >= 0 ? '+' : ''}
            {data.vsPreviousPeriodPct.toFixed(1)}% vs. mes anterior
          </Badge>
        </div>
        <ul className={styles.categories}>
          {categories.map(([category, amount]) => (
            <li key={category} className={styles.category}>
              <div className={styles.categoryHeader}>
                <span className={styles.categoryName}>{category}</span>
                <span className={styles.categoryAmount}>{formatCurrency(amount)}</span>
              </div>
              <Progress value={amount} max={maxCategory} />
            </li>
          ))}
        </ul>
      </>
    )
  }

  return (
    <Card padding="lg" aria-labelledby="spending-insight-heading">
      <h2 id="spending-insight-heading" className={styles.heading}>
        Insight de gastos
      </h2>
      {content}
    </Card>
  )
}
