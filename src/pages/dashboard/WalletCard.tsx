import { memo } from 'react'

import { cn } from '@/shared/lib/cn'
import type { CardModel } from '@/shared/types'

import styles from './WalletCard.module.css'

export interface WalletCardProps {
  card: CardModel
}

function ChipIcon() {
  return (
    <svg
      width="34"
      height="26"
      viewBox="0 0 34 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="32" height="24" rx="5" />
      <path d="M1 9h10M23 9h10M11 9v8h12V9M1 17h10M23 17h10" />
    </svg>
  )
}

/** Mini bank card shown inside the dashboard carousel. */
export const WalletCard = memo(function WalletCard({ card }: WalletCardProps) {
  return (
    <article className={cn(styles.card, styles[card.gradient])}>
      <div className={styles.top}>
        <ChipIcon />
        <span className={styles.label}>{card.label}</span>
      </div>
      <span className={styles.number}>•••• {card.last4}</span>
      <div className={styles.bottom}>
        <div className={styles.field}>
          <span className={styles.caption}>Titular</span>
          <span className={styles.value}>{card.holder}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.caption}>Expira</span>
          <span className={styles.value}>{card.expiry}</span>
        </div>
      </div>
    </article>
  )
})
