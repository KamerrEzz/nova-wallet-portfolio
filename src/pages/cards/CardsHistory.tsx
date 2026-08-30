import { useMemo } from 'react'

import { formatRelativeDate } from '@/shared/lib/format'
import type { CardModel } from '@/shared/types'
import { Badge, Card, EmptyState } from '@/shared/ui'

import { STATUS_LABEL, STATUS_VARIANT, expiryToDate } from './utils'
import styles from './CardsPage.module.css'

interface HistoryEntry {
  id: string
  card: CardModel
  expiryDate: Date | null
}

export interface CardsHistoryProps {
  cards: CardModel[]
}

/**
 * Actividad de tarjetas. La API mock no expone fechas de creación, así que
 * cada entrada se ordena por fecha de caducidad (la más próxima primero).
 */
export function CardsHistory({ cards }: CardsHistoryProps) {
  const entries = useMemo<HistoryEntry[]>(
    () =>
      cards
        .map((card) => ({ id: card.id, card, expiryDate: expiryToDate(card.expiry) }))
        .sort((a, b) => (a.expiryDate?.getTime() ?? Infinity) - (b.expiryDate?.getTime() ?? Infinity)),
    [cards],
  )

  if (entries.length === 0) {
    return <EmptyState title="Sin actividad" description="Todavía no tienes ninguna tarjeta" />
  }

  return (
    <Card glass padding="sm">
      <ul className={styles.historyList} role="list">
        {entries.map(({ id, card, expiryDate }) => (
          <li key={id} className={styles.historyItem}>
            <span className={styles.historyDot} data-status={card.status} aria-hidden="true" />
            <div className={styles.historyMain}>
              <p className={styles.historyTitle}>
                {card.label} ·• {card.last4}
              </p>
              <p className={styles.historyMeta}>
                {card.type === 'virtual' ? 'Tarjeta virtual' : 'Tarjeta física'} ·{' '}
                {expiryDate
                  ? card.status === 'expired'
                    ? `Caducó ${formatRelativeDate(expiryDate)}`
                    : `Caduca ${formatRelativeDate(expiryDate)}`
                  : `Caducidad ${card.expiry}`}
              </p>
            </div>
            <Badge variant={STATUS_VARIANT[card.status]}>{STATUS_LABEL[card.status]}</Badge>
          </li>
        ))}
      </ul>
    </Card>
  )
}
