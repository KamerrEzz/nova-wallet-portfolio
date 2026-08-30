import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { useUpdateCardMutation } from '@/shared/api/apiSlice'
import type { CardModel } from '@/shared/types'
import { Button, Input, Modal } from '@/shared/ui'

import styles from './CardsPage.module.css'

export interface CardLimitsModalProps {
  card: CardModel | null
  onClose: () => void
}

export function CardLimitsModal({ card, onClose }: CardLimitsModalProps) {
  const [updateCard, { isLoading }] = useUpdateCardMutation()
  const [dailyLimit, setDailyLimit] = useState('')
  const [monthlyLimit, setMonthlyLimit] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Sync the form with the card being edited.
  useEffect(() => {
    if (card) {
      setDailyLimit(String(card.dailyLimit))
      setMonthlyLimit(String(card.monthlyLimit))
      setError(null)
    }
  }, [card])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!card) return
    const daily = Number(dailyLimit)
    const monthly = Number(monthlyLimit)

    if (!Number.isFinite(daily) || daily <= 0 || !Number.isFinite(monthly) || monthly <= 0) {
      setError('Los límites deben ser cantidades mayores que 0')
      return
    }

    try {
      await updateCard({ id: card.id, body: { dailyLimit: daily, monthlyLimit: monthly } }).unwrap()
      onClose()
    } catch {
      setError('No se han podido guardar los límites. Inténtalo de nuevo.')
    }
  }

  return (
    <Modal
      open={card !== null}
      onClose={onClose}
      title={card ? `Límites de ${card.label}` : 'Límites'}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" form="card-limits" loading={isLoading}>
            Guardar
          </Button>
        </>
      }
    >
      <form id="card-limits" className={styles.modalForm} onSubmit={handleSubmit} noValidate>
        <Input
          label="Límite diario (€)"
          type="number"
          min={1}
          step="any"
          inputMode="decimal"
          value={dailyLimit}
          onChange={(event) => setDailyLimit(event.target.value)}
          hint="Máximo que puedes gastar en un día"
        />
        <Input
          label="Límite mensual (€)"
          type="number"
          min={1}
          step="any"
          inputMode="decimal"
          value={monthlyLimit}
          onChange={(event) => setMonthlyLimit(event.target.value)}
          hint="Máximo que puedes gastar en un mes"
        />
        {error && (
          <p className={styles.formError} role="alert">
            {error}
          </p>
        )}
      </form>
    </Modal>
  )
}
