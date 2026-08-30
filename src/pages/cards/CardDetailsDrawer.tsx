import { useEffect } from 'react'

import { useCreateDisposableCardMutation, useUpdateCardMutation } from '@/shared/api/apiSlice'
import { formatCurrency } from '@/shared/lib/format'
import type { CardModel } from '@/shared/types'
import { Badge, Button, Drawer, Switch } from '@/shared/ui'

import { CardVisual } from './CardVisual'
import { STATUS_LABEL, STATUS_VARIANT } from './utils'
import styles from './CardsPage.module.css'

export interface CardDetailsDrawerProps {
  card: CardModel | null
  onClose: () => void
  onEditLimits: (card: CardModel) => void
}

export function CardDetailsDrawer({ card, onClose, onEditLimits }: CardDetailsDrawerProps) {
  const [updateCard, { isLoading: updating }] = useUpdateCardMutation()
  const [createDisposable, { isLoading: creatingDisposable, isSuccess: disposableCreated, reset: resetDisposable }] =
    useCreateDisposableCardMutation()

  // Clear the disposable success notice when another card is shown.
  useEffect(() => {
    resetDisposable()
  }, [card?.id, resetDisposable])

  if (!card) {
    return <Drawer open={false} onClose={onClose} />
  }

  const frozen = card.status === 'frozen'
  const expired = card.status === 'expired'

  const update = (body: Partial<CardModel>) => {
    updateCard({ id: card.id, body })
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={`Tarjeta ${card.label}`}
      footer={
        !expired ? (
          <>
            <Button variant="secondary" onClick={() => onEditLimits(card)}>
              Editar límites
            </Button>
            <Button
              variant="ghost"
              loading={creatingDisposable}
              onClick={() => createDisposable(card.id)}
            >
              Crear tarjeta desechable
            </Button>
          </>
        ) : undefined
      }
    >
      <div className={styles.drawerBody}>
        <CardVisual card={card} className={styles.drawerVisual} />

        <div className={styles.drawerStatusRow}>
          <Badge variant={STATUS_VARIANT[card.status]} dot>
            {STATUS_LABEL[card.status]}
          </Badge>
          <Badge variant="accent">{card.type === 'virtual' ? 'Virtual' : 'Física'}</Badge>
        </div>

        <dl className={styles.detailList}>
          <div className={styles.detailRow}>
            <dt>Titular</dt>
            <dd>{card.holder}</dd>
          </div>
          <div className={styles.detailRow}>
            <dt>Número</dt>
            <dd>•••• {card.last4}</dd>
          </div>
          <div className={styles.detailRow}>
            <dt>Caducidad</dt>
            <dd>{card.expiry}</dd>
          </div>
          <div className={styles.detailRow}>
            <dt>Límite diario</dt>
            <dd>{formatCurrency(card.dailyLimit)}</dd>
          </div>
          <div className={styles.detailRow}>
            <dt>Límite mensual</dt>
            <dd>{formatCurrency(card.monthlyLimit)}</dd>
          </div>
        </dl>

        <div className={styles.settingsList} aria-label="Ajustes de la tarjeta">
          <Switch
            label="Congelada"
            checked={frozen}
            disabled={updating || expired}
            onChange={(checked) => update({ status: checked ? 'frozen' : 'active' })}
          />
          <Switch
            label="Pagos sin contacto"
            checked={card.contactless}
            disabled={updating || expired}
            onChange={(checked) => update({ contactless: checked })}
          />
          <Switch
            label="Pagos online"
            checked={card.onlinePayments}
            disabled={updating || expired}
            onChange={(checked) => update({ onlinePayments: checked })}
          />
        </div>

        {disposableCreated && (
          <p className={styles.successNote} role="status">
            Tarjeta desechable creada. La encontrarás en la pestaña Virtuales.
          </p>
        )}
      </div>
    </Drawer>
  )
}
