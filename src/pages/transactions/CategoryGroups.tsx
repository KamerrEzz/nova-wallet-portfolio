import { useMemo } from 'react'

import { formatCurrency } from '@/shared/lib/format'
import type { Transaction } from '@/shared/types'

import { CategoryIcon, categoryLabel } from './categoryMeta'
import { TransactionRow } from './TransactionRow'
import styles from './CategoryGroups.module.css'

interface CategoryGroup {
  key: string
  label: string
  subtotal: number
  currency: string
  items: Transaction[]
}

function groupByCategory(items: Transaction[]): CategoryGroup[] {
  const byKey = new Map<string, CategoryGroup>()

  for (const tx of items) {
    let group = byKey.get(tx.category)
    if (!group) {
      group = {
        key: tx.category,
        label: categoryLabel(tx.category),
        subtotal: 0,
        currency: tx.currency,
        items: [],
      }
      byKey.set(tx.category, group)
    }
    group.subtotal += tx.amount
    group.items.push(tx)
  }

  // Mayor volumen (en valor absoluto) primero.
  return [...byKey.values()].sort((a, b) => Math.abs(b.subtotal) - Math.abs(a.subtotal))
}

export interface CategoryGroupsProps {
  transactions: Transaction[]
  onSelect: (transaction: Transaction) => void
}

/** Vista «Por categoría»: movimientos agrupados con subtotal por categoría. */
export function CategoryGroups({ transactions, onSelect }: CategoryGroupsProps) {
  const groups = useMemo(() => groupByCategory(transactions), [transactions])
  const indexById = useMemo(
    () => new Map(transactions.map((tx, index) => [tx.id, index])),
    [transactions],
  )

  return (
    <div className={styles.listCard}>
      {groups.map((group) => (
        <section key={group.key} className={styles.group} aria-label={group.label}>
          <h3 className={styles.groupHeader}>
            <span className={styles.groupIcon}>
              <CategoryIcon category={group.key} />
            </span>
            <span className={styles.groupLabel}>{group.label}</span>
            <span className={styles.groupCount}>
              {group.items.length}{' '}
              {group.items.length === 1 ? 'movimiento' : 'movimientos'}
            </span>
            <span className={styles.groupSubtotal}>
              {group.subtotal > 0 ? '+' : ''}
              {formatCurrency(group.subtotal, group.currency)}
            </span>
          </h3>
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
