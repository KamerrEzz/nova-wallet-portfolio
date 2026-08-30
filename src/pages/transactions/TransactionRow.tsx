import { memo } from 'react'
import { motion } from 'framer-motion'

import { usePrefersReducedMotion } from '@/shared/hooks'
import { cn } from '@/shared/lib/cn'
import { formatCurrency, formatRelativeDate } from '@/shared/lib/format'
import type { Transaction } from '@/shared/types'
import { Badge } from '@/shared/ui'

import { CategoryIcon, categoryLabel } from './categoryMeta'
import styles from './TransactionRow.module.css'

export interface TransactionRowProps {
  transaction: Transaction
  /** Position in the flat list — drives the staggered entrance delay. */
  index: number
  onSelect: (transaction: Transaction) => void
}

export const TransactionRow = memo(function TransactionRow({
  transaction: tx,
  index,
  onSelect,
}: TransactionRowProps) {
  const reducedMotion = usePrefersReducedMotion()
  const isIncome = tx.amount > 0
  const isFailed = tx.status === 'failed'

  return (
    <motion.li
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.28,
        delay: reducedMotion ? 0 : Math.min(index, 14) * 0.035,
        ease: 'easeOut',
      }}
    >
      <button type="button" className={styles.row} onClick={() => onSelect(tx)}>
        <span className={cn(styles.icon, isIncome && styles.iconIncome)}>
          <CategoryIcon category={tx.category} />
        </span>
        <span className={styles.info}>
          <span className={cn(styles.title, isFailed && styles.titleFailed)}>{tx.title}</span>
          <span className={styles.meta}>
            {categoryLabel(tx.category)} · {formatRelativeDate(tx.date)}
          </span>
        </span>
        {tx.status === 'pending' && <Badge variant="neutral">Pendiente</Badge>}
        {isFailed && <Badge variant="danger">Fallida</Badge>}
        <span className={cn(styles.amount, isIncome && styles.amountIncome)}>
          {isIncome
            ? `+${formatCurrency(tx.amount, tx.currency)}`
            : formatCurrency(tx.amount, tx.currency)}
        </span>
      </button>
    </motion.li>
  )
})
