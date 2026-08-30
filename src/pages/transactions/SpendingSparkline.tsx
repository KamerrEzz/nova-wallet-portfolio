import { useMemo } from 'react'

import { useGetTransactionsQuery } from '@/shared/api/apiSlice'
import { formatCurrency } from '@/shared/lib/format'

import styles from './SpendingSparkline.module.css'

const DAYS = 30
const WIDTH = 120
const HEIGHT = 36
const PADDING = 2

interface DailyPoint {
  total: number
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** Mini-gráfica SVG con el gasto diario de los últimos 30 días. */
export function SpendingSparkline() {
  const from = useMemo(() => {
    const start = startOfDay(new Date())
    start.setDate(start.getDate() - (DAYS - 1))
    return start.toISOString()
  }, [])

  const { data } = useGetTransactionsQuery({
    type: 'expense',
    from,
    page: 1,
    pageSize: 200,
  })

  const points = useMemo<DailyPoint[]>(() => {
    const totals = new Map<number, number>()
    if (data) {
      for (const tx of data.items) {
        const day = startOfDay(new Date(tx.date)).getTime()
        totals.set(day, (totals.get(day) ?? 0) + Math.abs(tx.amount))
      }
    }

    const today = startOfDay(new Date())
    return Array.from({ length: DAYS }, (_, index) => {
      const day = new Date(today)
      day.setDate(today.getDate() - (DAYS - 1 - index))
      return { total: totals.get(day.getTime()) ?? 0 }
    })
  }, [data])

  const totalSpent = useMemo(() => points.reduce((sum, point) => sum + point.total, 0), [points])

  const { line, area } = useMemo(() => {
    const max = Math.max(...points.map((point) => point.total), 1)
    const stepX = (WIDTH - PADDING * 2) / (DAYS - 1)
    const coords = points.map((point, index) => {
      const x = PADDING + index * stepX
      const y = HEIGHT - PADDING - (point.total / max) * (HEIGHT - PADDING * 2)
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    return {
      line: coords.join(' '),
      area: `${PADDING},${HEIGHT - PADDING} ${coords.join(' ')} ${WIDTH - PADDING},${HEIGHT - PADDING}`,
    }
  }, [points])

  return (
    <div
      className={styles.root}
      role="img"
      aria-label={`Gasto diario de los últimos 30 días. Total: ${formatCurrency(totalSpent)}`}
    >
      <svg
        className={styles.chart}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polygon className={styles.area} points={area} />
        <polyline className={styles.line} points={line} />
      </svg>
      <p className={styles.caption}>
        Gasto 30 días · <strong>{formatCurrency(totalSpent)}</strong>
      </p>
    </div>
  )
}
