import { useId } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './Progress.module.css'

export type ProgressVariant = 'linear' | 'circular'

export interface ProgressProps {
  value: number
  max?: number
  label?: string
  variant?: ProgressVariant
  showValue?: boolean
  className?: string
}

const CIRCLE_SIZE = 64
const STROKE_WIDTH = 6
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function Progress({
  value,
  max = 100,
  label,
  variant = 'linear',
  showValue = false,
  className,
}: ProgressProps) {
  const labelId = useId()
  const clamped = Math.min(Math.max(value, 0), max)
  const percent = max > 0 ? (clamped / max) * 100 : 0
  const displayValue = `${Math.round(percent)}%`

  const a11yProps = {
    role: 'progressbar' as const,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    'aria-valuenow': clamped,
    'aria-labelledby': label ? labelId : undefined,
    'aria-label': label ? undefined : 'Progress',
  }

  return (
    <div className={cn(styles.root, className)}>
      {(label || showValue) && (
        <div className={styles.header}>
          {label && (
            <span className={styles.label} id={labelId}>
              {label}
            </span>
          )}
          {showValue && <span className={styles.value}>{displayValue}</span>}
        </div>
      )}
      {variant === 'linear' ? (
        <div className={styles.track} {...a11yProps}>
          <div className={styles.fill} style={{ width: `${percent}%` }} />
        </div>
      ) : (
        <div className={styles.circular}>
          <svg
            width={CIRCLE_SIZE}
            height={CIRCLE_SIZE}
            viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}
            {...a11yProps}
          >
            <circle
              className={styles.circleTrack}
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              strokeWidth={STROKE_WIDTH}
            />
            <circle
              className={styles.circleFill}
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - percent / 100)}
            />
          </svg>
          {showValue && !label && <span className={styles.circleValue}>{displayValue}</span>}
        </div>
      )}
    </div>
  )
}
