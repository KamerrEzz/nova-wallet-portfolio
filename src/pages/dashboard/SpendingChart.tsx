import { useMemo, useState } from 'react'

import { useGetTransactionsQuery } from '@/shared/api/apiSlice'
import { formatCurrency } from '@/shared/lib/format'
import type { Transaction } from '@/shared/types'
import { Card, EmptyState, ErrorState, Skeleton } from '@/shared/ui'

import styles from './SpendingChart.module.css'

const MONTHS_BACK = 6
const VIEW_W = 600
const VIEW_H = 260
const PAD_X = 12
const PAD_TOP = 20
const PAD_BOTTOM = 30

interface MonthBucket {
  key: string
  label: string
  total: number
  isCurrent: boolean
}

/** Aggregates expense transactions into the last 6 calendar months. */
function aggregateByMonth(items: Transaction[]): MonthBucket[] {
  const now = new Date()
  const buckets: MonthBucket[] = []

  for (let i = MONTHS_BACK - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: new Intl.DateTimeFormat('es-ES', { month: 'short' })
        .format(date)
        .replace('.', ''),
      total: 0,
      isCurrent: i === 0,
    })
  }

  const indexByKey = new Map(buckets.map((bucket, index) => [bucket.key, index]))

  for (const tx of items) {
    if (tx.status === 'failed') continue
    const date = new Date(tx.date)
    const index = indexByKey.get(`${date.getFullYear()}-${date.getMonth()}`)
    if (index !== undefined) {
      buckets[index].total += Math.abs(tx.amount)
    }
  }

  return buckets
}

/** Rounded-top bar path (falls back to a plain rect-ish path for tiny bars). */
function barPath(x: number, y: number, width: number, height: number): string {
  const r = Math.min(6, width / 2, height)
  if (r <= 0) return ''
  return [
    `M ${x} ${y + height}`,
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    `L ${x + width - r} ${y}`,
    `Q ${x + width} ${y} ${x + width} ${y + r}`,
    `L ${x + width} ${y + height}`,
    'Z',
  ].join(' ')
}

export function SpendingChart() {
  const { data, isLoading, isError, refetch } = useGetTransactionsQuery({
    page: 1,
    pageSize: 100,
    type: 'expense',
  })
  const [hovered, setHovered] = useState<number | null>(null)

  const buckets = useMemo(() => aggregateByMonth(data?.items ?? []), [data])

  const chartH = VIEW_H - PAD_TOP - PAD_BOTTOM
  const slot = (VIEW_W - PAD_X * 2) / MONTHS_BACK
  const barW = slot * 0.55
  const max = Math.max(...buckets.map((b) => b.total), 1)

  let content
  if (isLoading) {
    content = (
      <div className={styles.skeletonWrap} aria-busy="true">
        <Skeleton width="100%" height={220} borderRadius={12} />
      </div>
    )
  } else if (isError || !data) {
    content = (
      <ErrorState title="No hemos podido cargar tus gastos" onRetry={refetch} />
    )
  } else if (data.items.length === 0) {
    content = (
      <EmptyState
        title="Sin gastos todavía"
        description="Cuando registres gastos, aquí verás tu evolución mensual."
      />
    )
  } else {
    content = (
      <div className={styles.chartWrap}>
        {hovered !== null && buckets[hovered].total > 0 && (
          <div
            className={styles.tooltip}
            style={{
              left: `${((PAD_X + slot * hovered + slot / 2) / VIEW_W) * 100}%`,
            }}
          >
            {formatCurrency(buckets[hovered].total)}
          </div>
        )}
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="img"
          aria-label="Gastos de los últimos 6 meses"
          className={styles.svg}
        >
          <line
            x1={PAD_X}
            x2={VIEW_W - PAD_X}
            y1={PAD_TOP + chartH}
            y2={PAD_TOP + chartH}
            className={styles.axis}
          />
          {buckets.map((bucket, i) => {
            const barH = (bucket.total / max) * chartH
            const x = PAD_X + slot * i + (slot - barW) / 2
            const y = PAD_TOP + chartH - barH
            return (
              <g
                key={bucket.key}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <title>{`${bucket.label}: ${formatCurrency(bucket.total)}`}</title>
                {/* Invisible hit area so hovering works even for empty months. */}
                <rect
                  x={PAD_X + slot * i}
                  y={PAD_TOP}
                  width={slot}
                  height={chartH}
                  fill="transparent"
                />
                {barH > 0 && (
                  <path
                    d={barPath(x, y, barW, barH)}
                    className={bucket.isCurrent ? styles.barCurrent : styles.bar}
                  />
                )}
                <text
                  x={PAD_X + slot * i + slot / 2}
                  y={VIEW_H - 8}
                  textAnchor="middle"
                  className={styles.monthLabel}
                >
                  {bucket.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  return (
    <Card padding="lg" aria-labelledby="spending-heading">
      <h2 id="spending-heading" className={styles.heading}>
        Gastos por mes
      </h2>
      {content}
    </Card>
  )
}
