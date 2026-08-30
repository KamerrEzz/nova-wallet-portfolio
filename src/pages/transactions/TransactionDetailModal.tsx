import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { formatCurrency, formatDate } from '@/shared/lib/format'
import type { Transaction } from '@/shared/types'
import { Badge, Button, Modal } from '@/shared/ui'
import type { BadgeVariant } from '@/shared/ui'

import { categoryLabel } from './categoryMeta'
import styles from './TransactionDetailModal.module.css'

const FULL_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}

const STATUS_META: Record<Transaction['status'], { label: string; variant: BadgeVariant }> = {
  completed: { label: 'Completada', variant: 'success' },
  pending: { label: 'Pendiente', variant: 'neutral' },
  failed: { label: 'Fallida', variant: 'danger' },
}

export interface TransactionDetailModalProps {
  transaction: Transaction | null
  onClose: () => void
}

export function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProps) {
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef<number | null>(null)

  // Reset the "Copiado" state whenever another transaction is opened.
  useEffect(() => {
    setCopied(false)
  }, [transaction])

  useEffect(
    () => () => {
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current)
    },
    [],
  )

  const handleShare = useCallback(async () => {
    if (!transaction) return
    const amount = formatCurrency(transaction.amount, transaction.currency)
    const summary = [
      transaction.title,
      `${transaction.amount > 0 ? '+' : ''}${amount}`,
      formatDate(transaction.date, FULL_DATE_OPTIONS),
      `ID: ${transaction.id}`,
    ].join(' · ')

    try {
      await navigator.clipboard.writeText(summary)
    } catch {
      // Clipboard unavailable (permissions, insecure context) — still give feedback.
    }
    setCopied(true)
    if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current)
    copyTimerRef.current = window.setTimeout(() => setCopied(false), 2000)
  }, [transaction])

  const status = transaction ? STATUS_META[transaction.status] : null
  const isIncome = transaction ? transaction.amount > 0 : false

  return (
    <Modal open={transaction !== null} onClose={onClose} title="Detalle del movimiento" size="sm">
      {transaction && status && (
        <>
          <div className={styles.header}>
            <p className={cn(styles.amount, isIncome && styles.amountIncome)}>
              {isIncome
                ? `+${formatCurrency(transaction.amount, transaction.currency)}`
                : formatCurrency(transaction.amount, transaction.currency)}
            </p>
            <Badge variant={status.variant} dot>
              {status.label}
            </Badge>
          </div>
          <dl className={styles.details}>
            <div className={styles.row}>
              <dt className={styles.term}>Título</dt>
              <dd className={styles.value}>{transaction.title}</dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.term}>Categoría</dt>
              <dd className={styles.value}>{categoryLabel(transaction.category)}</dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.term}>Fecha</dt>
              <dd className={styles.value}>{formatDate(transaction.date, FULL_DATE_OPTIONS)}</dd>
            </div>
            {transaction.counterparty && (
              <div className={styles.row}>
                <dt className={styles.term}>Contraparte</dt>
                <dd className={styles.value}>{transaction.counterparty}</dd>
              </div>
            )}
            <div className={styles.row}>
              <dt className={styles.term}>ID</dt>
              <dd className={cn(styles.value, styles.mono)}>{transaction.id}</dd>
            </div>
          </dl>
          <div className={styles.footer}>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              {copied ? 'Copiado' : 'Compartir'}
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}
