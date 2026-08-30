import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './Input.module.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  /** Error message — rendered with role="alert" and marks the input invalid. */
  error?: string
  hint?: string
  leftIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leftIcon, id, className, ...rest },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')

  return (
    <div className={cn(styles.field, className)}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className={cn(styles.control, error && styles.invalid)}>
        {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          {...rest}
        />
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
