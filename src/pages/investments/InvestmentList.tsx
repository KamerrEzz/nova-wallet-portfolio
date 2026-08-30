import { useMemo } from 'react'

import { useGetInvestmentsQuery } from '@/shared/api/apiSlice'
import { formatCurrency } from '@/shared/lib/format'
import type { Investment } from '@/shared/types'
import { Badge, Card, EmptyState, ErrorState, Skeleton } from '@/shared/ui'

import { Sparkline } from './Sparkline'
import { buildSparklineSeries } from './sparklineSeries'
import styles from './InvestmentList.module.css'

const TYPE_LABELS: Record<Investment['type'], string> = {
  stock: 'Acción',
  etf: 'ETF',
  crypto: 'Cripto',
}

function formatChange(pct: number): string {
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`
}

export function InvestmentListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className={styles.skeletonList} aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} width="100%" height={56} borderRadius={12} />
      ))}
    </div>
  )
}

export function InvestmentList() {
  const { data, isLoading, isError, refetch } = useGetInvestmentsQuery()

  const seriesById = useMemo(() => {
    const map = new Map<string, number[]>()
    for (const item of data ?? []) {
      map.set(item.id, buildSparklineSeries(item))
    }
    return map
  }, [data])

  let content
  if (isLoading) {
    content = <InvestmentListSkeleton />
  } else if (isError || !data) {
    content = <ErrorState title="No hemos podido cargar tus inversiones" onRetry={refetch} />
  } else if (data.length === 0) {
    content = (
      <EmptyState
        title="Aún no tienes inversiones"
        description="Cuando empieces a invertir, aquí verás tu portafolio."
      />
    )
  } else {
    content = (
      <ul className={styles.list}>
        {data.map((item) => {
          const value = item.quantity * item.currentPrice
          const positive = item.change24hPct >= 0
          return (
            <li
              key={item.id}
              className={styles.row}
              aria-label={`${item.name}: ${formatCurrency(value)}, variación 24 h ${formatChange(item.change24hPct)}`}
            >
              <span className={styles.symbol} aria-hidden="true">
                {item.symbol.slice(0, 4)}
              </span>
              <span className={styles.info}>
                <span className={styles.name}>{item.name}</span>
                <span className={styles.meta}>
                  <Badge variant="neutral">{TYPE_LABELS[item.type]}</Badge>
                  <span>
                    {item.quantity} uds. · {formatCurrency(item.currentPrice)}
                  </span>
                </span>
              </span>
              <span className={styles.sparkCell}>
                <Sparkline data={seriesById.get(item.id) ?? []} positive={positive} />
              </span>
              <span className={styles.numbers}>
                <span className={styles.value}>{formatCurrency(value)}</span>
                <Badge variant={positive ? 'success' : 'danger'}>{formatChange(item.change24hPct)}</Badge>
              </span>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <Card padding="lg" aria-labelledby="investment-list-heading">
      <h2 id="investment-list-heading" className={styles.heading}>
        Tus inversiones
      </h2>
      {content}
    </Card>
  )
}
