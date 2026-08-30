import { useMemo } from 'react'

import { useGetSpendingInsightQuery } from '@/shared/api/apiSlice'
import { formatCurrency } from '@/shared/lib/format'
import { Badge, Card, EmptyState, ErrorState, Skeleton } from '@/shared/ui'

import styles from './MiniInsight.module.css'

export function MiniInsight() {
  const { data, isLoading, isError, refetch } = useGetSpendingInsightQuery()

  const topCategory = useMemo(() => {
    if (!data) return null
    const entries = Object.entries(data.byCategory)
    if (entries.length === 0) return null
    return entries.sort((a, b) => b[1] - a[1])[0]
  }, [data])

  let content
  if (isLoading) {
    content = (
      <div className={styles.skeletonWrap} aria-busy="true">
        <Skeleton width="40%" height={20} borderRadius={999} />
        <Skeleton width="100%" height={44} borderRadius={12} />
      </div>
    )
  } else if (isError || !data) {
    content = <ErrorState title="No hemos podido cargar tu insight" onRetry={refetch} />
  } else if (!topCategory) {
    content = (
      <EmptyState
        title="Sin gastos este mes"
        description="Cuando registres gastos, aquí verás un insight inteligente."
      />
    )
  } else {
    const lessSpending = data.vsPreviousPeriodPct <= 0
    const pct = Math.abs(data.vsPreviousPeriodPct).toFixed(1)
    const [category, amount] = topCategory
    content = (
      <div className={styles.body}>
        <Badge variant={lessSpending ? 'success' : 'danger'}>
          {lessSpending ? 'Buen ritmo' : 'Ojo al gasto'}
        </Badge>
        <p className={styles.message}>
          Este mes gastas un {pct}% {lessSpending ? 'menos' : 'más'} que el mes pasado; tu
          mayor gasto es en {category} ({formatCurrency(amount)}).
        </p>
      </div>
    )
  }

  return (
    <Card padding="lg" aria-labelledby="mini-insight-heading">
      <h2 id="mini-insight-heading" className={styles.heading}>
        Insight inteligente
      </h2>
      {content}
    </Card>
  )
}
