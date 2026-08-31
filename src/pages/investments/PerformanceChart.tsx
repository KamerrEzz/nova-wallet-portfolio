import { useId, useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { useGetInvestmentPerformanceQuery } from '@/shared/api/apiSlice'
import { usePrefersReducedMotion } from '@/shared/hooks'
import { formatCurrency, formatDate, formatRelativeDate } from '@/shared/lib/format'
import { Badge, Card, EmptyState, ErrorState, Skeleton } from '@/shared/ui'

import styles from './PerformanceChart.module.css'

interface PerformancePoint {
  date: string
  value: number
}

interface PerformanceTooltipProps {
  active?: boolean
  payload?: { payload?: PerformancePoint }[]
}

function PerformanceTooltip({ active, payload }: PerformanceTooltipProps) {
  const point = active ? payload?.[0]?.payload : undefined
  if (!point) return null

  return (
    <div className={styles.tooltip}>
      <span className={styles.tooltipDate}>{formatDate(point.date)}</span>
      <span className={styles.tooltipValue}>{formatCurrency(point.value)}</span>
    </div>
  )
}

export function PerformanceChart() {
  const { data, isLoading, isError, refetch } = useGetInvestmentPerformanceQuery(undefined, {
    // Fresh random series from the BFF on every visit.
    refetchOnMountOrArgChange: true,
  })
  const reducedMotion = usePrefersReducedMotion()
  const gradientId = `perf-gradient-${useId().replace(/:/g, '')}`

  const stats = useMemo(() => {
    if (!data || data.length < 2) return null

    const first = data[0]
    const last = data[data.length - 1]

    return {
      changePct: first.value > 0 ? ((last.value - first.value) / first.value) * 100 : 0,
      lastDate: last.date,
    }
  }, [data])

  let content
  if (isLoading) {
    content = (
      <div className={styles.skeletonWrap} aria-busy="true">
        <Skeleton width="100%" height={260} borderRadius={12} />
      </div>
    )
  } else if (isError || !data) {
    content = <ErrorState title="No hemos podido cargar el rendimiento" onRetry={refetch} />
  } else if (!stats) {
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
          <Badge variant={stats.changePct >= 0 ? 'success' : 'danger'}>
            {stats.changePct >= 0 ? '+' : ''}
            {stats.changePct.toFixed(1)}% en 90 días
          </Badge>
          <span className={styles.updated}>Actualizado {formatRelativeDate(stats.lastDate)}</span>
        </div>
        <div
          className={styles.chartWrap}
          role="img"
          aria-label={`Evolución del valor del portafolio en los últimos 90 días, de ${formatCurrency(data[0].value)} a ${formatCurrency(data[data.length - 1].value)}`}
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" className={styles.stopTop} />
                  <stop offset="100%" className={styles.stopBottom} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(date: string) => formatDate(date, { day: 'numeric', month: 'short' })}
                tickLine={false}
                axisLine={false}
                minTickGap={40}
                tickMargin={8}
              />
              <YAxis
                tickFormatter={(value: number) => formatCurrency(value)}
                tickLine={false}
                axisLine={false}
                width={84}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<PerformanceTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                fill={`url(#${gradientId})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={!reducedMotion}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
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
