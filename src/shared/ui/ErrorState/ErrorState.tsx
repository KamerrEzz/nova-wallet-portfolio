import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { Button } from '../Button/Button'
import styles from './ErrorState.module.css'

export interface ErrorStateProps {
  /** Defaults to "No hemos podido cargar los datos". */
  title?: string
  description?: string
  /** When provided, renders a "Reintentar" button. */
  onRetry?: () => void
  icon?: ReactNode
  className?: string
}

function DefaultIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    </svg>
  )
}

export function ErrorState({
  title = 'No hemos podido cargar los datos',
  description,
  onRetry,
  icon,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn(styles.root, className)} role="alert">
      <div className={styles.icon} aria-hidden="true">
        {icon ?? <DefaultIcon />}
      </div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {onRetry && (
        <div className={styles.action}>
          <Button variant="secondary" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      )}
    </div>
  )
}
