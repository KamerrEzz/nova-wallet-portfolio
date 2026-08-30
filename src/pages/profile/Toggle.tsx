import { cn } from '@/shared/lib/cn'

import styles from './Toggle.module.css'

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Accessible label when no visible label is associated. */
  'aria-label'?: string
  id?: string
}

/**
 * Interruptor accesible: botón con role="switch", operable con teclado
 * (Enter/Espacio disparan click de forma nativa).
 */
export function Toggle({ checked, onChange, id, ...rest }: ToggleProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      className={cn(styles.toggle, checked && styles.on)}
      onClick={() => onChange(!checked)}
      {...rest}
    >
      <span className={styles.thumb} aria-hidden="true" />
    </button>
  )
}
