import type { CSSProperties } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './Skeleton.module.css'

export interface SkeletonProps {
  width?: number | string
  height?: number | string
  borderRadius?: number | string
  /** Renders a circle (width = height). */
  circle?: boolean
  className?: string
  style?: CSSProperties
}

function toCss(value: number | string | undefined): string | undefined {
  return typeof value === 'number' ? `${value}px` : value
}

export function Skeleton({ width, height, borderRadius, circle, className, style }: SkeletonProps) {
  const size = circle ? (toCss(width) ?? toCss(height)) : undefined
  return (
    <span
      aria-hidden="true"
      className={cn(styles.skeleton, circle && styles.circle, className)}
      style={{
        width: size ?? toCss(width) ?? '100%',
        height: size ?? toCss(height) ?? '1em',
        borderRadius: circle ? undefined : (toCss(borderRadius) ?? 'var(--radius-sm)'),
        ...style,
      }}
    />
  )
}

export interface SkeletonTextProps {
  /** Number of lines. */
  lines?: number
  className?: string
}

/** Multi-line text placeholder. */
export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn(styles.text, className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          height="0.85em"
          width={index === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  )
}
