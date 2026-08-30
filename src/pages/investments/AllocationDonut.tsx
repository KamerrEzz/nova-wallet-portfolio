import { useMemo } from 'react'

import { useGetInvestmentsQuery } from '@/shared/api/apiSlice'
import { formatCurrency } from '@/shared/lib/format'
import type { Investment } from '@/shared/types'
import { Card, EmptyState, ErrorState, Skeleton } from '@/shared/ui'

import styles from './AllocationDonut.module.css'

const SIZE = 180
const STROKE = 28
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const TYPE_META: Record<Investment['type'], { label: string; segClass: string }> = {
  stock: { label: 'Acciones', segClass: styles.segStock },
  etf: { label: 'ETFs', segClass: styles.segEtf },
  crypto: { label: 'Cripto', segClass: styles.segCrypto },
}

const TYPE_ORDER: Investment['type'][] = ['stock', 'etf', 'crypto']

interface Slice {
  type: Investment['type']
  value: number
  pct: number
}

export function AllocationDonut() {
  const { data, isLoading, isError, refetch } = useGetInvestmentsQuery()

  const { slices, total } = useMemo(() => {
    const byType = new Map<Investment['type'], number>()
    let sum = 0
    for (const item of data ?? []) {
      const value = item.quantity * item.currentPrice
      byType.set(item.type, (byType.get(item.type) ?? 0) + value)
      sum += value
    }

    const result: Slice[] = TYPE_ORDER.filter((type) => (byType.get(type) ?? 0) > 0).map((type) => ({
      type,
      value: byType.get(type) ?? 0,
      pct: sum > 0 ? ((byType.get(type) ?? 0) / sum) * 100 : 0,
    }))

    return { slices: result, total: sum }
  }, [data])

  let content
  if (isLoading) {
    content = (
      <div className={styles.skeletonWrap} aria-busy="true">
        <Skeleton circle width={SIZE} height={SIZE} />
        <Skeleton width="100%" height={72} borderRadius={12} />
      </div>
    )
  } else if (isError || !data) {
    content = <ErrorState title="No hemos podido cargar la distribución" onRetry={refetch} />
  } else if (slices.length === 0) {
    content = (
      <EmptyState
        title="Sin activos todavía"
        description="Cuando tengas inversiones, aquí verás cómo se reparten."
      />
    )
  } else {
    let offset = 0
    content = (
      <div className={styles.content}>
        <div className={styles.donutWrap}>
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            role="img"
            aria-label={slices
              .map((s) => `${TYPE_META[s.type].label} ${s.pct.toFixed(0)}%`)
              .join(', ')}
            className={styles.svg}
          >
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              strokeWidth={STROKE}
              className={styles.track}
            />
            {slices.map((slice) => {
              const length = (slice.pct / 100) * CIRCUMFERENCE
              const dashOffset = -offset
              offset += length
              return (
                <circle
                  key={slice.type}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  strokeWidth={STROKE}
                  strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                  strokeDashoffset={dashOffset}
                  className={TYPE_META[slice.type].segClass}
                />
              )
            })}
          </svg>
          <div className={styles.center}>
            <span className={styles.centerLabel}>Total</span>
            <span className={styles.centerValue}>{formatCurrency(total)}</span>
          </div>
        </div>
        <ul className={styles.legend}>
          {slices.map((slice) => (
            <li key={slice.type} className={styles.legendItem}>
              <span
                className={`${styles.dot} ${styles[`dot${slice.type[0].toUpperCase()}${slice.type.slice(1)}`]}`}
                aria-hidden="true"
              />
              <span className={styles.legendLabel}>{TYPE_META[slice.type].label}</span>
              <span className={styles.legendValue}>
                {formatCurrency(slice.value)} · {slice.pct.toFixed(0)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <Card padding="lg" aria-labelledby="allocation-heading">
      <h2 id="allocation-heading" className={styles.heading}>
        Distribución de activos
      </h2>
      {content}
    </Card>
  )
}
