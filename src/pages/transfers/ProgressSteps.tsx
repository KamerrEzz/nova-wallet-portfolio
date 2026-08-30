import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/shared/lib/cn'

import styles from './transfers.module.css'

const STEP_LABELS = ['Destinatario', 'Importe', 'Confirmar'] as const

interface ProgressStepsProps {
  /** Index of the active step (0-based). */
  current: number
  /** Navigates back to a completed step. */
  onBack: (step: number) => void
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

/** Progress indicator — completed steps are clickable to go back only. */
export function ProgressSteps({ current, onBack }: ProgressStepsProps) {
  const reduceMotion = useReducedMotion()

  return (
    <ol className={styles.steps} aria-label="Progreso de la transferencia">
      {STEP_LABELS.map((label, index) => {
        const done = index < current
        const isCurrent = index === current
        const dot = (
          <span className={styles.dot} aria-hidden="true">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={done ? 'check' : index}
                className={styles.dotContent}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
              >
                {done ? <CheckIcon /> : index + 1}
              </motion.span>
            </AnimatePresence>
          </span>
        )
        return (
          <li
            key={label}
            className={cn(styles.step, done && styles.done, isCurrent && styles.current)}
            aria-current={isCurrent ? 'step' : undefined}
          >
            {done ? (
              <button type="button" className={styles.stepButton} onClick={() => onBack(index)}>
                {dot}
                <span>{label}</span>
              </button>
            ) : (
              <span className={styles.stepLabel}>
                {dot}
                <span>{label}</span>
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
