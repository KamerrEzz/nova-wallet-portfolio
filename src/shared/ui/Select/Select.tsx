import { forwardRef, useId } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './Select.module.css'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  /** Error message — rendered with role="alert" and marks the select invalid. */
  error?: string
  hint?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, id, className, children, ...rest },
  ref,
) {
  const autoId = useId()
  const selectId = id ?? autoId
  const errorId = `${selectId}-error`
  const hintId = `${selectId}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')

  return (
    <div className={cn(styles.field, className)}>
      {label && (
        <label className={styles.label} htmlFor={selectId}>
          {label}
        </label>
      )}
      <div className={cn(styles.control, error && styles.invalid)}>
        <select
          ref={ref}
          id={selectId}
          className={styles.select}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          {...rest}
        >
          {children}
        </select>
        <span className={styles.chevron} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </div>
      {error && (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      )}
    </div>
  )
})
