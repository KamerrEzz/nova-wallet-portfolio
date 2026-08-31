import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'
import styles from './SegmentedControl.module.css'

export interface SegmentedOption {
  value: string
  label: string
}

export interface SegmentedControlProps {
  options: SegmentedOption[]
  value: string
  onChange: (value: string) => void
  className?: string
  'aria-label'?: string
}

export function SegmentedControl({ options, value, onChange, className, 'aria-label': ariaLabel }: SegmentedControlProps) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn(styles.root, className)}>
      {options.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            className={cn(styles.option, isActive && styles.active)}
            onClick={() => onChange(option.value)}
          >
            {isActive && (
              <motion.span
                layoutId="segmented-thumb"
                className={styles.thumb}
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
            <span className={styles.text}>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
