import { useMemo } from 'react'

import { useGetInvestmentsQuery } from '@/shared/api/apiSlice'
import { formatCurrency } from '@/shared/lib/format'
import { Badge, Card, ErrorState, Skeleton, Stat } from '@/shared/ui'

import styles from './PortfolioSummary.module.css'

export function PortfolioSummary() {
  const { data, isLoading, isError, refetch } = useGetInvestmentsQuery()

  const summary = useMemo(() => {
    if (!data || data.length === 0) return null

    const total = data.reduce((sum, item) => sum + item.quantity * item.currentPrice, 0)
    const invested = data.reduce((sum, item) => sum + item.quantity * item.avgPrice, 0)
    const dayChangePct =
      total > 0
        ? data.reduce((sum, item) => sum + item.quantity * item.currentPrice * item.change24hPct, 0) / total
        : 0
    const returnPct = invested > 0 ? ((total - invested) / invested) * 100 : 0

    return { total, invested, dayChangePct, returnPct }
  }, [data])

  let content
  if (isLoading) {
    content = (
      <div className={styles.skeletonWrap} aria-busy="true">
        <Skeleton width="40%" height={36} borderRadius={8} />
        <Skeleton width="100%" height={48} borderRadius={8} />
      </div>
    )
  } else if (isError || !data) {
    content = <ErrorState title="No hemos podido cargar tu portafolio" onRetry={refetch} />
  } else if (!summary) {
    content = <p className={styles.empty}>Aún no tienes inversiones.</p>
  } else {
    content = (
      <div className={styles.stats}>
        <div className={styles.mainStat}>
          <Stat label="Valor total" value={summary.total} delta={summary.dayChangePct} />
          <p className={styles.caption}>La insignia muestra la variación de las últimas 24 h</p>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Invertido</span>
          <span className={styles.value}>{formatCurrency(summary.invested)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Rentabilidad total</span>
          <Badge variant={summary.returnPct >= 0 ? 'success' : 'danger'}>
            {summary.returnPct >= 0 ? '+' : ''}
            {summary.returnPct.toFixed(1)}%
          </Badge>
        </div>
      </div>
    )
  }

  return (
    <Card padding="lg" aria-labelledby="portfolio-summary-heading">
      <h2 id="portfolio-summary-heading" className={styles.heading}>
        Resumen del portafolio
      </h2>
      {content}
    </Card>
  )
}
