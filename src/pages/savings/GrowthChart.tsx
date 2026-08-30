import { useMemo } from 'react'

import { formatCurrency } from '@/shared/lib/format'
import type { Vault } from '@/shared/types'
import { Card, EmptyState, Skeleton } from '@/shared/ui'

import styles from './GrowthChart.module.css'

const MONTHS_BACK = 6
const VIEW_W = 600
const VIEW_H = 240
const PAD_X = 16
const PAD_TOP = 20
const PAD_BOTTOM = 30

interface MonthPoint {
  key: string
  label: string
  value: number
}

/**
 * Approximates cumulative savings per month: a vault contributes its full
 * balance to every month after its creation, prorated within its first month.
 */
function buildSeries(vaults: Vault[]): MonthPoint[] {
  const now = new Date()
  const points: MonthPoint[] = []

  for (let i = MONTHS_BACK - 1; i >= 0; i -= 1) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd =
      i === 0 ? now : new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)

    let total = 0
    for (const vault of vaults) {
      const created = new Date(vault.createdAt)
      if (created <= monthStart) {
        total += vault.currentAmount
      } else if (created <= monthEnd) {
        const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate()
        const elapsed = Math.min(monthEnd.getDate(), daysInMonth) - created.getDate() + 1
        total += (vault.currentAmount * Math.max(elapsed, 0)) / daysInMonth
      }
    }

    points.push({
      key: `${monthStart.getFullYear()}-${monthStart.getMonth()}`,
      label: new Intl.DateTimeFormat('es-ES', { month: 'short' })
        .format(monthStart)
        .replace('.', ''),
      value: total,
    })
  }

  return points
}

export interface GrowthChartProps {
  vaults: Vault[]
  isLoading: boolean
}

export function GrowthChart({ vaults, isLoading }: GrowthChartProps) {
  const points = useMemo(() => buildSeries(vaults), [vaults])

  const chartW = VIEW_W - PAD_X * 2
  const chartH = VIEW_H - PAD_TOP - PAD_BOTTOM
  const max = Math.max(...points.map((point) => point.value), 1)
  const stepX = points.length > 1 ? chartW / (points.length - 1) : 0

  const coords = points.map((point, index) => ({
    x: PAD_X + stepX * index,
    y: PAD_TOP + chartH - (point.value / max) * chartH,
  }))

  const linePath = coords
    .map((coord, index) => `${index === 0 ? 'M' : 'L'} ${coord.x} ${coord.y}`)
    .join(' ')
  const areaPath = `${linePath} L ${PAD_X + chartW} ${PAD_TOP + chartH} L ${PAD_X} ${PAD_TOP + chartH} Z`

  let content
  if (isLoading) {
    content = (
      <div aria-busy="true" aria-label="Cargando gráfico">
        <Skeleton width="100%" height={220} borderRadius={12} />
      </div>
    )
  } else if (vaults.length === 0) {
    content = (
      <EmptyState
        title="Sin datos todavía"
        description="Cuando empieces a ahorrar, aquí verás la evolución de tus bóvedas."
      />
    )
  } else {
    content = (
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label="Evolución del ahorro de los últimos 6 meses"
        className={styles.svg}
      >
        <defs>
          <linearGradient id="growth-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className={styles.gradientStart} />
            <stop offset="100%" className={styles.gradientEnd} />
          </linearGradient>
        </defs>
        <line
          x1={PAD_X}
          x2={VIEW_W - PAD_X}
          y1={PAD_TOP + chartH}
          y2={PAD_TOP + chartH}
          className={styles.axis}
        />
        <path d={areaPath} fill="url(#growth-fill)" />
        <path d={linePath} className={styles.line} />
        {points.map((point, index) => (
          <g key={point.key}>
            <title>{`${point.label}: ${formatCurrency(point.value)}`}</title>
            <circle cx={coords[index].x} cy={coords[index].y} r={4} className={styles.dot}>
              <title>{`${point.label}: ${formatCurrency(point.value)}`}</title>
            </circle>
            <text
              x={coords[index].x}
              y={VIEW_H - 8}
              textAnchor="middle"
              className={styles.monthLabel}
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    )
  }

  const total = points.length > 0 ? points[points.length - 1].value : 0

  return (
    <Card padding="lg" aria-labelledby="growth-heading">
      <div className={styles.header}>
        <h2 id="growth-heading" className={styles.heading}>
          Evolución del ahorro
        </h2>
        {!isLoading && vaults.length > 0 && (
          <span className={styles.total}>{formatCurrency(total)}</span>
        )}
      </div>
      {content}
    </Card>
  )
}
