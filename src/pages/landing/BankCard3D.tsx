import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'
import { usePrefersReducedMotion, useTilt } from '@/shared/hooks'
import styles from './BankCard3D.module.css'

export type BankCardVariant = 'lime' | 'violet' | 'mono'

export interface BankCard3DProps {
  /** Gradient skin of the card. */
  variant?: BankCardVariant
  /** Pointer-follow 3D tilt. Automatically disabled under reduced motion. */
  tilt?: boolean
  /** Gentle idle floating oscillation. */
  float?: boolean
  className?: string
}

function ChipIcon() {
  return (
    <svg className={styles.chip} viewBox="0 0 46 34" aria-hidden="true" focusable="false">
      <rect x="1.5" y="1.5" width="43" height="31" rx="7" className={styles.chipBody} />
      <path
        d="M1 12.5h13M32 12.5h13M1 21.5h13M32 21.5h13M15 1.5v11M31 1.5v11M15 21.5v11M31 21.5v11"
        className={styles.chipLines}
      />
    </svg>
  )
}

function ContactlessIcon() {
  return (
    <svg
      className={styles.contactless}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="5.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <path d="M8.5 8.5a5 5 0 0 1 0 7" />
      <path d="M11.8 5.8a9 9 0 0 1 0 12.4" />
      <path d="M15.1 3.2a13 13 0 0 1 0 17.6" />
    </svg>
  )
}

/** Realistic 3D NOVA bank card with tilt, specular glare and idle float. */
export function BankCard3D({ variant = 'lime', tilt = true, float = false, className }: BankCard3DProps) {
  const reducedMotion = usePrefersReducedMotion()
  const { ref, style, glareStyle, glareEnabled, handlers } = useTilt<HTMLDivElement>({ max: 10, scale: 1.03 })

  return (
    <motion.div
      className={styles.floatWrap}
      animate={float && !reducedMotion ? { y: [0, -10, 0] } : undefined}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.div
        ref={tilt ? ref : undefined}
        className={cn(styles.card, styles[variant], className)}
        style={tilt ? style : undefined}
        {...(tilt ? handlers : {})}
        role="img"
        aria-label="Tarjeta bancaria NOVA terminada en 4242"
      >
        {tilt && glareEnabled && <motion.div className={styles.glare} style={glareStyle} aria-hidden="true" />}
        <div className={styles.topRow}>
          <span className={styles.wordmark}>NOVA</span>
          <ContactlessIcon />
        </div>
        <ChipIcon />
        <span className={styles.number}>••••&nbsp;&nbsp;••••&nbsp;&nbsp;••••&nbsp;&nbsp;4242</span>
        <div className={styles.bottomRow}>
          <span className={styles.field}>
            <span className={styles.fieldLabel}>Titular</span>
            <span className={styles.fieldValue}>ALEX NOVA</span>
          </span>
          <span className={styles.field}>
            <span className={styles.fieldLabel}>Expira</span>
            <span className={styles.fieldValue}>09/29</span>
          </span>
          <span className={styles.brandMark} aria-hidden="true" />
        </div>
      </motion.div>
    </motion.div>
  )
}
