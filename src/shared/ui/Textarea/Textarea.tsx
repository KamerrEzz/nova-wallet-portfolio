import { forwardRef, useId } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './Textarea.module.css'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  /** Error message — rendered with role="alert" and marks the textarea invalid. */
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, id, className, ...rest },
  ref,
) {
  const autoId = useId()
  const textareaId = id ?? autoId
  const errorId = `${textareaId}-error`
  const hintId = `${textareaId}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')

  return (
    <div className={cn(styles.field, className)}>
      {label && (
        <label className={styles.label} htmlFor={textareaId}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        className={cn(styles.textarea, error && styles.invalid)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...rest}
      />
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
