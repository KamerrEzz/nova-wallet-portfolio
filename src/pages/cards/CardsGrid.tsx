import { useUpdateCardMutation } from '@/shared/api/apiSlice'
import { formatCurrency } from '@/shared/lib/format'
import type { CardModel } from '@/shared/types'
import { Badge, Button, Card, Skeleton } from '@/shared/ui'

import { CardVisual } from './CardVisual'
import { STATUS_LABEL, STATUS_VARIANT } from './utils'
import styles from './CardsPage.module.css'

interface CardItemProps {
  card: CardModel
  onSelect: (card: CardModel) => void
  onEditLimits: (card: CardModel) => void
}

function FreezeIcon() {
  return (
    <svg
      width="14"
      height="14"
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

function CardItem({ card, onSelect, onEditLimits }: CardItemProps) {
  const [updateCard, { isLoading: freezing }] = useUpdateCardMutation()
  const frozen = card.status === 'frozen'
  const expired = card.status === 'expired'

  const toggleFreeze = () => {
    updateCard({ id: card.id, body: { status: frozen ? 'active' : 'frozen' } })
  }

  return (
    <Card glass padding="md" className={styles.cardItem}>
      <button
        type="button"
        className={styles.visualButton}
        onClick={() => onSelect(card)}
        aria-label={`Ver detalles de la tarjeta ${card.label}`}
      >
        <CardVisual card={card} />
      </button>
      <div className={styles.cardInfo}>
        <div className={styles.cardTitleRow}>
          <h2 className={styles.cardLabel}>{card.label}</h2>
          <Badge variant={STATUS_VARIANT[card.status]} dot>
            {STATUS_LABEL[card.status]}
          </Badge>
        </div>
        <p className={styles.cardMeta}>
          Límite diario {formatCurrency(card.dailyLimit)} · mensual {formatCurrency(card.monthlyLimit)}
        </p>
        <div className={styles.cardActions}>
          {!expired && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<FreezeIcon />}
              loading={freezing}
              aria-pressed={frozen}
              onClick={toggleFreeze}
            >
              {frozen ? 'Descongelar' : 'Congelar'}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onEditLimits(card)}>
            Límites
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onSelect(card)}>
            Detalles
          </Button>
        </div>
      </div>
    </Card>
  )
}

export interface CardsGridProps {
  cards: CardModel[]
  onSelect: (card: CardModel) => void
  onEditLimits: (card: CardModel) => void
}

export function CardsGrid({ cards, onSelect, onEditLimits }: CardsGridProps) {
  return (
    <ul className={styles.grid} role="list">
      {cards.map((card) => (
        <li key={card.id}>
          <CardItem card={card} onSelect={onSelect} onEditLimits={onEditLimits} />
        </li>
      ))}
    </ul>
  )
}

export function CardsGridSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className={styles.grid} aria-hidden="true">
      {Array.from({ length: items }, (_, index) => (
        <Card key={index} glass padding="md" className={styles.cardItem}>
          <Skeleton className={styles.skeletonVisual} borderRadius="var(--radius-lg)" />
          <div className={styles.cardInfo}>
            <Skeleton width="40%" height="1.2em" />
            <Skeleton width="70%" />
            <div className={styles.cardActions}>
              <Skeleton width={96} height={32} borderRadius="var(--radius-full)" />
              <Skeleton width={72} height={32} borderRadius="var(--radius-full)" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
