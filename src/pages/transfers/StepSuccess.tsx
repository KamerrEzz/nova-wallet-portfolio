import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/shared/lib/cn'
import { formatCurrency } from '@/shared/lib/format'
import type { User } from '@/shared/types'
import { Button } from '@/shared/ui'

import { useFocusHeading } from './useFocusHeading'
import styles from './transfers.module.css'

interface StepSuccessProps {
  recipient: User
  amount: number
  onReset: () => void
  onGoDashboard: () => void
}

/** Final state — animated confirmation after a successful transfer. */
export function StepSuccess({ recipient, amount, onReset, onGoDashboard }: StepSuccessProps) {
  const headingRef = useFocusHeading<HTMLHeadingElement>()
  const reduceMotion = useReducedMotion()

  return (
    <div className={styles.success}>
      <motion.svg
        className={styles.checkIcon}
        viewBox="0 0 52 52"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <motion.circle
          cx="26"
          cy="26"
          r="24"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.5, ease: 'easeOut' }}
        />
        <motion.path
          d="M15 27l7.5 7.5L37 19"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: reduceMotion ? 0 : 0.4,
            delay: reduceMotion ? 0 : 0.35,
            ease: 'easeOut',
          }}
        />
      </motion.svg>

      <h2 ref={headingRef} tabIndex={-1} className={styles.stepTitle}>
        Transferencia enviada
      </h2>
      <p className={styles.successDetail}>
        {formatCurrency(amount)} enviados a {recipient.name}
      </p>

      <div className={cn(styles.actions, styles.actionsCenter)}>
        <Button variant="ghost" onClick={onReset}>
          Hacer otra transferencia
        </Button>
        <Button onClick={onGoDashboard}>Ir al panel</Button>
      </div>
    </div>
  )
}
