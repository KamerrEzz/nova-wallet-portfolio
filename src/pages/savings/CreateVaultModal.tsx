import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { useCreateVaultMutation } from '@/shared/api/apiSlice'
import { Button, Input, Modal, Select } from '@/shared/ui'

import styles from './modals.module.css'

export interface CreateVaultModalProps {
  open: boolean
  onClose: () => void
}

const ICON_OPTIONS = ['💰', '✈️', '🛡️', '💻', '🏠', '🚗', '🎓', '💍']

const COLOR_OPTIONS = [
  { value: '#c6f24e', label: 'Lima' },
  { value: '#7c6cff', label: 'Violeta' },
  { value: '#4ade80', label: 'Verde' },
  { value: '#f2f4f1', label: 'Neutro' },
]

export function CreateVaultModal({ open, onClose }: CreateVaultModalProps) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [icon, setIcon] = useState(ICON_OPTIONS[0])
  const [color, setColor] = useState(COLOR_OPTIONS[0].value)
  const [error, setError] = useState<string | null>(null)

  const [createVault, { isLoading }] = useCreateVaultMutation()

  // Reset the form each time the modal opens.
  useEffect(() => {
    if (open) {
      setName('')
      setTarget('')
      setIcon(ICON_OPTIONS[0])
      setColor(COLOR_OPTIONS[0].value)
      setError(null)
    }
  }, [open])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Ponle un nombre a la bóveda')
      return
    }
    const targetAmount = target === '' ? undefined : Number(target)
    if (targetAmount !== undefined && (!Number.isFinite(targetAmount) || targetAmount <= 0)) {
      setError('El objetivo debe ser mayor que cero')
      return
    }
    try {
      await createVault({
        name: trimmed,
        targetAmount,
        icon,
        color,
        currency: 'EUR',
      }).unwrap()
      onClose()
    } catch {
      // El apiSlice ya muestra un toast con el error del servidor.
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nueva bóveda"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="create-vault-form" loading={isLoading}>
            Crear bóveda
          </Button>
        </>
      }
    >
      <form id="create-vault-form" className={styles.form} onSubmit={handleSubmit}>
        <Input
          label="Nombre"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Vacaciones, fondo de emergencia…"
          autoFocus
          required
        />
        <Input
          label="Objetivo (opcional)"
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          placeholder="0,00 €"
          hint="Deja el campo vacío si no quieres fijar un objetivo."
        />
        <div className={styles.row}>
          <Select
            label="Icono"
            value={icon}
            onChange={(event) => setIcon(event.target.value)}
            aria-label="Icono de la bóveda"
          >
            {ICON_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <Select
            label="Color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
          >
            {COLOR_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
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
