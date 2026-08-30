import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'
import { useTilt } from '@/shared/hooks'
import type { CardModel } from '@/shared/types'
import styles from './CardVisual.module.css'

export interface CardVisualProps {
  card: CardModel
  /** Pointer-follow 3D tilt. Automatically disabled under reduced motion. */
  tilt?: boolean
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

function FrozenIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1" />
    </svg>
  )
}

/** Bank card visual with gradient skin, 3D tilt, glare and frozen overlay. */
export function CardVisual({ card, tilt = true, className }: CardVisualProps) {
  const { ref, style, glareStyle, glareEnabled, handlers } = useTilt<HTMLDivElement>({ max: 10, scale: 1.03 })
  const frozen = card.status === 'frozen'

  return (
    <motion.div
      ref={tilt ? ref : undefined}
      className={cn(styles.card, styles[card.gradient], frozen && styles.frozen, className)}
      style={tilt ? style : undefined}
      {...(tilt ? handlers : {})}
      role="img"
      aria-label={`Tarjeta ${card.label} terminada en ${card.last4}${frozen ? ', congelada' : ''}`}
    >
      {tilt && glareEnabled && <motion.div className={styles.glare} style={glareStyle} aria-hidden="true" />}
      <div className={styles.topRow}>
        <span className={styles.wordmark}>NOVA</span>
        <div className={styles.topRight}>
          {card.type === 'virtual' && <span className={styles.virtualTag}>Virtual</span>}
          <ContactlessIcon />
        </div>
      </div>
      <ChipIcon />
      <span className={styles.number}>••••&nbsp;&nbsp;••••&nbsp;&nbsp;••••&nbsp;&nbsp;{card.last4}</span>
      <div className={styles.bottomRow}>
        <span className={styles.field}>
          <span className={styles.fieldLabel}>Titular</span>
          <span className={styles.fieldValue}>{card.holder}</span>
        </span>
        <span className={styles.field}>
          <span className={styles.fieldLabel}>Expira</span>
          <span className={styles.fieldValue}>{card.expiry}</span>
        </span>
        <span className={styles.brandMark} aria-hidden="true" />
      </div>
      {frozen && (
        <div className={styles.frozenOverlay} aria-hidden="true">
          <FrozenIcon />
          <span>Congelada</span>
        </div>
      )}
    </motion.div>
  )
}
