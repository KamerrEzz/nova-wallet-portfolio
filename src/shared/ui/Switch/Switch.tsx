import { cn } from '@/shared/lib/cn'
import styles from './Switch.module.css'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
  /** Accessible label when the visible label lives outside the switch. */
  'aria-label'?: string
}

export function Switch({ checked, onChange, label, disabled = false, className, 'aria-label': ariaLabel }: SwitchProps) {
  return (
    <label className={cn(styles.root, disabled && styles.disabled, className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label ? undefined : (ariaLabel ?? 'Toggle')}
        disabled={disabled}
        className={cn(styles.track, checked && styles.on)}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.knob} />
      </button>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  )
}
