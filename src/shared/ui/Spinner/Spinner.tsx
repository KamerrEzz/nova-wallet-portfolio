import { cn } from '@/shared/lib/cn'
import styles from './Spinner.module.css'

export type SpinnerSize = 'sm' | 'md' | 'lg'

export interface SpinnerProps {
  size?: SpinnerSize
  /** Accessible label announced via role="status". */
  label?: string
  className?: string
}

export function Spinner({ size = 'md', label = 'Cargando', className }: SpinnerProps) {
  return (
    <span role="status" className={cn(styles.spinner, styles[size], className)}>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" width="100%" height="100%">
        <circle
          className={styles.track}
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <span className={styles.srOnly}>{label}</span>
    </span>
  )
}
