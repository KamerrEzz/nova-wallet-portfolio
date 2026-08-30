import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { useCreateGoalMutation } from '@/shared/api/apiSlice'
import type { Goal, Vault } from '@/shared/types'
import { Button, Input, Modal, Select } from '@/shared/ui'

import styles from './modals.module.css'

export interface CreateGoalModalProps {
  open: boolean
  onClose: () => void
  vaults: Vault[]
}

type AutoRule = NonNullable<Goal['autoRule']>

export function CreateGoalModal({ open, onClose, vaults }: CreateGoalModalProps) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [vaultId, setVaultId] = useState('')
  const [autoRule, setAutoRule] = useState<AutoRule | ''>('')
  const [autoValue, setAutoValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [createGoal, { isLoading }] = useCreateGoalMutation()

  // Reset the form each time the modal opens.
  useEffect(() => {
    if (open) {
      setName('')
      setTarget('')
      setTargetDate('')
      setVaultId(vaults[0]?.id ?? '')
      setAutoRule('')
      setAutoValue('')
      setError(null)
    }
  }, [open, vaults])

  const needsValue = autoRule === 'percentage' || autoRule === 'fixed'

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    const targetAmount = Number(target)
    if (!trimmed) {
      setError('Ponle un nombre a la meta')
      return
    }
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      setError('El objetivo debe ser mayor que cero')
      return
    }
    if (!targetDate) {
      setError('Elige una fecha límite')
      return
    }
    if (!vaultId) {
      setError('Elige una bóveda para esta meta')
      return
    }
    const parsedAutoValue = needsValue ? Number(autoValue) : undefined
    if (
      needsValue &&
      (parsedAutoValue === undefined || !Number.isFinite(parsedAutoValue) || parsedAutoValue <= 0)
    ) {
      setError(
        autoRule === 'percentage'
          ? 'Introduce un porcentaje mayor que cero'
          : 'Introduce un importe mayor que cero',
      )
      return
    }
    try {
      await createGoal({
        name: trimmed,
        targetAmount,
        targetDate: new Date(targetDate).toISOString(),
        vaultId,
        autoRule: autoRule || undefined,
        autoValue: parsedAutoValue,
      }).unwrap()
      onClose()
    } catch {
      // El consumidor ve el fallo al no cerrarse el modal.
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva meta"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="create-goal-form" loading={isLoading}>
            Crear meta
          </Button>
        </>
      }
    >
      <form id="create-goal-form" className={styles.form} onSubmit={handleSubmit}>
        <Input
          label="Nombre"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Viaje, entrada del piso…"
          autoFocus
          required
        />
        <div className={styles.row}>
          <Input
            label="Objetivo"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            placeholder="0,00 €"
            required
          />
          <Input
            label="Fecha límite"
            type="date"
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
            required
          />
        </div>
        <Select
          label="Bóveda"
          value={vaultId}
          onChange={(event) => setVaultId(event.target.value)}
        >
          {vaults.length === 0 && <option value="">Sin bóvedas disponibles</option>}
          {vaults.map((vault) => (
            <option key={vault.id} value={vault.id}>
              {vault.name}
            </option>
          ))}
        </Select>
        <div className={styles.row}>
          <Select
            label="Regla automática (opcional)"
            value={autoRule}
            onChange={(event) => setAutoRule(event.target.value as AutoRule | '')}
          >
            <option value="">Sin regla</option>
            <option value="roundup">Redondeo de compras</option>
            <option value="percentage">Porcentaje de cada ingreso</option>
            <option value="fixed">Aporte fijo mensual</option>
          </Select>
          {needsValue && (
            <Input
              label={autoRule === 'percentage' ? 'Porcentaje (%)' : 'Importe mensual (€)'}
              type="number"
              min="0"
              step={autoRule === 'percentage' ? '1' : '0.01'}
              inputMode="decimal"
              value={autoValue}
              onChange={(event) => setAutoValue(event.target.value)}
              required
            />
          )}
        </div>
        {error && (
          <p className={styles.formError} role="alert">
            {error}
          </p>
        )}
      </form>
    </Modal>
  )
}
