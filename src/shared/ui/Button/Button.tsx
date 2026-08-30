import { forwardRef } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import { cn } from '@/shared/lib/cn'
import { Spinner } from '../Spinner/Spinner'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Shows a spinner and disables the button. */
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: ReactNode
  children?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    leftIcon,
    disabled,
    type = 'button',
    children,
    className,
    ...rest
  },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type={type}
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className)}
      {...rest}
    >
      {loading ? (
        <Spinner size="sm" label="Cargando" />
      ) : (
        leftIcon && <span className={styles.icon}>{leftIcon}</span>
      )}
      {children}
    </motion.button>
  )
})
