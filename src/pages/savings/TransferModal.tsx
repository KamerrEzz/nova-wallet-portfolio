import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { useTransferToVaultMutation } from '@/shared/api/apiSlice'
import { formatCurrency } from '@/shared/lib/format'
import type { Vault } from '@/shared/types'
import { Button, Input, Modal } from '@/shared/ui'

import styles from './modals.module.css'

export interface TransferModalProps {
  vault: Vault | null
  onClose: () => void
}

export function TransferModal({ vault, onClose }: TransferModalProps) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [transferToVault, { isLoading }] = useTransferToVaultMutation()

  // Reset the form whenever a vault is (re)selected.
  useEffect(() => {
    if (vault) {
      setAmount('')
      setError(null)
    }
  }, [vault])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!vault) return
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setError('Introduce una cantidad mayor que cero')
      return
    }
    try {
      await transferToVault({ id: vault.id, amount: value }).unwrap()
      onClose()
    } catch {
      // El apiSlice ya muestra un toast con el error del servidor.
    }
  }

  const remaining =
    vault?.targetAmount !== undefined
      ? Math.max(vault.targetAmount - vault.currentAmount, 0)
      : undefined

  return (
    <Modal
      open={vault !== null}
      onClose={onClose}
      title={vault ? `Añadir a «${vault.name}»` : 'Añadir dinero'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="transfer-vault-form" loading={isLoading}>
            Mover dinero
          </Button>
        </>
      }
    >
      {vault && (
        <form id="transfer-vault-form" className={styles.form} onSubmit={handleSubmit}>
          <p className={styles.summary}>
            Ahorrado: <strong>{formatCurrency(vault.currentAmount, vault.currency)}</strong>
            {remaining !== undefined && (
              <>
                {' '}
                · Te faltan <strong>{formatCurrency(remaining, vault.currency)}</strong> para el
                objetivo
              </>
            )}
          </p>
          <Input
            label="Cantidad"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0,00 €"
            autoFocus
            required
            error={error ?? undefined}
          />
        </form>
      )}
    </Modal>
  )
}
