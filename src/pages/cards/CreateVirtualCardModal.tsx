import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { useCreateVirtualCardMutation } from '@/shared/api/apiSlice'
import type { CardModel } from '@/shared/types'
import { Button, Input, Modal, Select } from '@/shared/ui'

import styles from './CardsPage.module.css'

export interface CreateVirtualCardModalProps {
  open: boolean
  onClose: () => void
}

const GRADIENT_OPTIONS: { value: CardModel['gradient']; label: string }[] = [
  { value: 'lime', label: 'Lima' },
  { value: 'violet', label: 'Violeta' },
  { value: 'mono', label: 'Monocroma' },
]

export function CreateVirtualCardModal({ open, onClose }: CreateVirtualCardModalProps) {
  const [createVirtualCard, { isLoading }] = useCreateVirtualCardMutation()
  const [label, setLabel] = useState('')
  const [gradient, setGradient] = useState<CardModel['gradient']>('violet')
  const [dailyLimit, setDailyLimit] = useState('500')
  const [monthlyLimit, setMonthlyLimit] = useState('2000')
  const [error, setError] = useState<string | null>(null)

  // Reset the form every time the modal opens.
  useEffect(() => {
    if (open) {
      setLabel('')
      setGradient('violet')
      setDailyLimit('500')
      setMonthlyLimit('2000')
      setError(null)
    }
  }, [open])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const daily = Number(dailyLimit)
    const monthly = Number(monthlyLimit)

    if (!label.trim()) {
      setError('Ponle un nombre a la tarjeta')
      return
    }
    if (!Number.isFinite(daily) || daily <= 0 || !Number.isFinite(monthly) || monthly <= 0) {
      setError('Los límites deben ser cantidades mayores que 0')
      return
    }

    try {
      await createVirtualCard({
        label: label.trim(),
        gradient,
        dailyLimit: daily,
        monthlyLimit: monthly,
        type: 'virtual',
      }).unwrap()
      onClose()
    } catch {
      setError('No se ha podido crear la tarjeta. Inténtalo de nuevo.')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva tarjeta virtual"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" form="create-virtual-card" loading={isLoading}>
            Crear tarjeta
          </Button>
        </>
      }
    >
      <form id="create-virtual-card" className={styles.modalForm} onSubmit={handleSubmit} noValidate>
        <Input
          label="Nombre de la tarjeta"
          placeholder="Compras online"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          maxLength={32}
          autoFocus
        />
        <Select
          label="Diseño"
          value={gradient}
          onChange={(event) => setGradient(event.target.value as CardModel['gradient'])}
        >
          {GRADIENT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Input
          label="Límite diario (€)"
          type="number"
          min={1}
          step="any"
          inputMode="decimal"
          value={dailyLimit}
          onChange={(event) => setDailyLimit(event.target.value)}
        />
        <Input
          label="Límite mensual (€)"
          type="number"
          min={1}
          step="any"
          inputMode="decimal"
          value={monthlyLimit}
          onChange={(event) => setMonthlyLimit(event.target.value)}
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
