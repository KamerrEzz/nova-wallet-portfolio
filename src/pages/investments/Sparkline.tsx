import { cn } from '@/shared/lib/cn'

import styles from './Sparkline.module.css'

const VIEW_W = 96
const VIEW_H = 32
const PAD = 2

export interface SparklineProps {
  data: number[]
  positive: boolean
}

/** Mini line chart. Decorative — the row text already conveys the change. */
export function Sparkline({ data, positive }: SparklineProps) {
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data
    .map((value, i) => {
      const x = PAD + (i / (data.length - 1)) * (VIEW_W - PAD * 2)
      const y = PAD + (1 - (value - min) / range) * (VIEW_H - PAD * 2)
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={cn(styles.svg, positive ? styles.up : styles.down)}
      aria-hidden="true"
      focusable="false"
    >
      <polyline points={points} fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
