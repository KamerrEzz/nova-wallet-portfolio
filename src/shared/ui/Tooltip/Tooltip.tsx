import { useId } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './Tooltip.module.css'

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left'
export type TooltipAlign = 'start' | 'center' | 'end'

export interface TooltipProps {
  content: ReactNode
  side?: TooltipSide
  align?: TooltipAlign
  children: ReactNode
  className?: string
}

export function Tooltip({ content, side = 'top', align = 'center', children, className }: TooltipProps) {
  const tooltipId = useId()

  return (
    <span className={cn(styles.root, className)} aria-describedby={tooltipId}>
      {children}
      <span
        role="tooltip"
        id={tooltipId}
        className={cn(styles.tooltip, styles[side], styles[`align-${align}`])}
      >
        {content}
      </span>
    </span>
  )
}
