import { cn } from '@/shared/lib/cn'
import { formatCurrency } from '@/shared/lib/format'
import { useCountUp } from '@/shared/hooks/useCountUp'
import { useInView } from '@/shared/hooks/useInView'
import { Badge } from '../Badge/Badge'
import styles from './Stat.module.css'

export interface StatProps {
  label: string
  /** Target number — counts up when the stat scrolls into view. */
  value: number
  /** Percent change, e.g. 4.2 or -1.8. Rendered as a colored badge. */
  delta?: number
  /** Value formatter. Defaults to EUR currency formatting. */
  formatValue?: (value: number) => string
  className?: string
}

export function Stat({ label, value, delta, formatValue = formatCurrency, className }: StatProps) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const animated = useCountUp(value, { start: inView })

  return (
    <div ref={ref} className={cn(styles.stat, className)}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {delta !== undefined && (
          <Badge variant={delta >= 0 ? 'success' : 'danger'}>
            {delta >= 0 ? '+' : ''}
            {delta.toFixed(1)}%
          </Badge>
        )}
      </div>
      <span className={styles.value}>{formatValue(animated)}</span>
    </div>
  )
}
