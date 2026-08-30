import { useId, useMemo } from 'react'

import { useGetInvestmentPerformanceQuery } from '@/shared/api/apiSlice'
import { formatCurrency, formatDate, formatRelativeDate } from '@/shared/lib/format'
import { Badge, Card, EmptyState, ErrorState, Skeleton } from '@/shared/ui'

import styles from './PerformanceChart.module.css'

const VIEW_W = 600
const VIEW_H = 280
const PAD_X = 16
const PAD_TOP = 28
const PAD_BOTTOM = 36

interface ChartData {
  linePath: string
  areaPath: string
  endX: number
  endY: number
  min: number
  max: number
  changePct: number
  firstDate: string
  midDate: string
  lastDate: string
}

function buildChart(points: { date: string; value: number }[]): ChartData | null {
  if (points.length < 2) return null

  const chartW = VIEW_W - PAD_X * 2
  const chartH = VIEW_H - PAD_TOP - PAD_BOTTOM
  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const coords = points.map((p, i) => ({
    x: PAD_X + (i / (points.length - 1)) * chartW,
    y: PAD_TOP + (1 - (p.value - min) / range) * chartH,
  }))

  const linePath = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
    .join(' ')
  const baseline = PAD_TOP + chartH
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(2)} ${baseline} L ${coords[0].x.toFixed(2)} ${baseline} Z`

  const first = points[0]
  const last = points[points.length - 1]

  return {
    linePath,
    areaPath,
    endX: coords[coords.length - 1].x,
    endY: coords[coords.length - 1].y,
    min,
    max,
    changePct: first.value > 0 ? ((last.value - first.value) / first.value) * 100 : 0,
    firstDate: first.date,
    midDate: points[Math.floor(points.length / 2)].date,
    lastDate: last.date,
  }
}

export function PerformanceChart() {
  const { data, isLoading, isError, refetch } = useGetInvestmentPerformanceQuery()
  const gradientId = `perf-gradient-${useId().replace(/:/g, '')}`

  const chart = useMemo(() => (data ? buildChart(data) : null), [data])

  let content
  if (isLoading) {
    content = (
      <div className={styles.skeletonWrap} aria-busy="true">
        <Skeleton width="100%" height={260} borderRadius={12} />
      </div>
    )
  } else if (isError || !data) {
    content = <ErrorState title="No hemos podido cargar el rendimiento" onRetry={refetch} />
  } else if (!chart) {
    content = (
      <EmptyState
        title="Sin datos de rendimiento"
        description="Cuando tu portafolio tenga histórico, aquí verás su evolución."
      />
    )
  } else {
    content = (
      <>
        <div className={styles.chartHeader}>
          <Badge variant={chart.changePct >= 0 ? 'success' : 'danger'}>
            {chart.changePct >= 0 ? '+' : ''}
            {chart.changePct.toFixed(1)}% en 90 días
          </Badge>
          <span className={styles.updated}>Actualizado {formatRelativeDate(chart.lastDate)}</span>
        </div>
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="img"
          aria-label={`Evolución del valor del portafolio en los últimos 90 días, de ${formatCurrency(data[0].value)} a ${formatCurrency(data[data.length - 1].value)}`}
          className={styles.svg}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className={styles.stopTop} />
              <stop offset="100%" className={styles.stopBottom} />
            </linearGradient>
          </defs>
          <line
            x1={PAD_X}
            x2={VIEW_W - PAD_X}
            y1={PAD_TOP + VIEW_H - PAD_TOP - PAD_BOTTOM}
            y2={PAD_TOP + VIEW_H - PAD_TOP - PAD_BOTTOM}
            className={styles.axis}
          />
          <text x={PAD_X} y={PAD_TOP - 10} className={styles.valueLabel}>
            {formatCurrency(chart.max)}
          </text>
          <text x={VIEW_W - PAD_X} y={PAD_TOP - 10} textAnchor="end" className={styles.valueLabel}>
            {formatCurrency(chart.min)}
          </text>
          <path d={chart.areaPath} fill={`url(#${gradientId})`} />
          <path d={chart.linePath} className={styles.line} />
          <circle cx={chart.endX} cy={chart.endY} r={4} className={styles.endDot} />
          <text x={PAD_X} y={VIEW_H - 10} className={styles.dateLabel}>
            {formatDate(chart.firstDate, { day: 'numeric', month: 'short' })}
          </text>
          <text x={VIEW_W / 2} y={VIEW_H - 10} textAnchor="middle" className={styles.dateLabel}>
            {formatDate(chart.midDate, { day: 'numeric', month: 'short' })}
          </text>
          <text x={VIEW_W - PAD_X} y={VIEW_H - 10} textAnchor="end" className={styles.dateLabel}>
            {formatDate(chart.lastDate, { day: 'numeric', month: 'short' })}
          </text>
        </svg>
      </>
    )
  }

  return (
    <Card padding="lg" aria-labelledby="performance-heading">
      <h2 id="performance-heading" className={styles.heading}>
        Rendimiento del portafolio
      </h2>
      {content}
    </Card>
  )
}
