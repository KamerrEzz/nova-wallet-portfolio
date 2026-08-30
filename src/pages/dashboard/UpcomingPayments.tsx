import { useMemo } from 'react'

import { formatCurrency, formatRelativeDate } from '@/shared/lib/format'
import { Badge, Card } from '@/shared/ui'

import styles from './UpcomingPayments.module.css'

/* ------------------------------------------------------------------ */
/* Mock subscriptions                                                  */
/* ------------------------------------------------------------------ */

interface Subscription {
  id: string
  name: string
  amount: number
  /** Day of the month the payment is charged. */
  dayOfMonth: number
}

const SUBSCRIPTIONS: Subscription[] = [
  { id: 'netflix', name: 'Netflix', amount: 12.99, dayOfMonth: 5 },
  { id: 'spotify', name: 'Spotify', amount: 9.99, dayOfMonth: 12 },
  { id: 'gym', name: 'Gimnasio', amount: 29.9, dayOfMonth: 18 },
  { id: 'rent', name: 'Alquiler', amount: 850, dayOfMonth: 28 },
]

const MS_PER_DAY = 86_400_000
const DUE_SOON_DAYS = 3

/** Next occurrence of the subscription's day of month, from today. */
function nextDueDate(dayOfMonth: number): Date {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let due = new Date(now.getFullYear(), now.getMonth(), dayOfMonth)
  if (due.getTime() < startOfToday.getTime()) {
    due = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth)
  }
  return due
}

function daysUntil(date: Date): number {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((date.getTime() - startOfToday.getTime()) / MS_PER_DAY)
}

export function UpcomingPayments() {
  const payments = useMemo(
    () =>
      SUBSCRIPTIONS.map((sub) => ({ ...sub, due: nextDueDate(sub.dayOfMonth) })).sort(
        (a, b) => a.due.getTime() - b.due.getTime(),
      ),
    [],
  )

  const total = payments.reduce((sum, sub) => sum + sub.amount, 0)

  return (
    <Card padding="lg" aria-labelledby="upcoming-payments-heading">
      <div className={styles.head}>
        <h2 id="upcoming-payments-heading" className={styles.heading}>
          Próximos pagos
        </h2>
        <span className={styles.total}>{formatCurrency(total)}/mes</span>
      </div>
      <ul className={styles.list}>
        {payments.map((sub) => {
          const dueSoon = daysUntil(sub.due) <= DUE_SOON_DAYS
          return (
            <li key={sub.id} className={styles.row}>
              <span className={styles.avatar} aria-hidden="true">
                {sub.name.charAt(0)}
              </span>
              <div className={styles.info}>
                <span className={styles.name}>{sub.name}</span>
                <span className={styles.due}>{formatRelativeDate(sub.due)}</span>
              </div>
              {dueSoon && <Badge variant="accent">Pronto</Badge>}
              <span className={styles.amount}>{formatCurrency(sub.amount)}</span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
