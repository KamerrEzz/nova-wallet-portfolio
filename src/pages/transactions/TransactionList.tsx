import { useMemo } from 'react'

import { formatDate, formatRelativeDate } from '@/shared/lib/format'
import type { Transaction } from '@/shared/types'
import { Skeleton } from '@/shared/ui'

import { TransactionRow } from './TransactionRow'
import styles from './TransactionList.module.css'

interface DayGroup {
  key: string
  label: string
  items: Transaction[]
}

function groupLabel(date: string): string {
  const relative = formatRelativeDate(date)
  if (relative === 'hoy') return 'Hoy'
  if (relative === 'ayer') return 'Ayer'
  return formatDate(date)
}

function groupByDay(items: Transaction[]): DayGroup[] {
  const groups: DayGroup[] = []
  const byKey = new Map<string, DayGroup>()

  for (const tx of items) {
    const date = new Date(tx.date)
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    let group = byKey.get(key)
    if (!group) {
      group = { key, label: groupLabel(tx.date), items: [] }
      byKey.set(key, group)
      groups.push(group)
    }
    group.items.push(tx)
  }

  return groups
}

export interface TransactionListProps {
  transactions: Transaction[]
  onSelect: (transaction: Transaction) => void
}

export function TransactionList({ transactions, onSelect }: TransactionListProps) {
  const groups = useMemo(() => groupByDay(transactions), [transactions])
  const indexById = useMemo(
    () => new Map(transactions.map((tx, index) => [tx.id, index])),
    [transactions],
  )

  return (
    <div className={styles.listCard}>
      {groups.map((group) => (
        <section key={group.key} className={styles.group} aria-label={group.label}>
          <h3 className={styles.groupLabel}>{group.label}</h3>
          <ul className={styles.list}>
            {group.items.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                index={indexById.get(tx.id) ?? 0}
                onSelect={onSelect}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export function TransactionListSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className={styles.listCard} aria-busy="true">
      <ul className={styles.list}>
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} className={styles.skeletonRow}>
            <Skeleton circle width={36} />
            <div className={styles.skeletonInfo}>
              <Skeleton width="45%" height={13} />
              <Skeleton width="28%" height={11} />
            </div>
            <Skeleton width={72} height={13} />
          </li>
        ))}
      </ul>
    </div>
  )
}
