import type { HTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './Badge.module.css'

export type BadgeVariant = 'success' | 'danger' | 'neutral' | 'accent'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  /** Renders a small status dot before the content. */
  dot?: boolean
}

export function Badge({ variant = 'neutral', dot = false, className, children, ...rest }: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[variant], className)} {...rest}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  )
}
