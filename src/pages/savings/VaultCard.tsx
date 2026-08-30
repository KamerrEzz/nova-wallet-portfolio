import { useUpdateVaultMutation } from '@/shared/api/apiSlice'
import { formatCurrency, formatRelativeDate } from '@/shared/lib/format'
import type { Vault } from '@/shared/types'
import { Badge, Button, Card, Progress, Switch } from '@/shared/ui'

import styles from './VaultCard.module.css'

export interface VaultCardProps {
  vault: Vault
  onTransfer: () => void
}

export function VaultCard({ vault, onTransfer }: VaultCardProps) {
  const [updateVault, { isLoading: updating }] = useUpdateVaultMutation()

  const hasTarget = vault.targetAmount !== undefined && vault.targetAmount > 0
  const completed = hasTarget && vault.currentAmount >= (vault.targetAmount as number)

  const toggleLocked = (locked: boolean) => {
    updateVault({ id: vault.id, body: { locked } })
  }

  return (
    <Card padding="lg" hover className={styles.card}>
      <div className={styles.header}>
        <span
          className={styles.icon}
          style={{ backgroundColor: vault.color ?? 'var(--surface-2)' }}
          aria-hidden="true"
        >
          {vault.icon ?? '💰'}
        </span>
        <div className={styles.heading}>
          <h3 className={styles.name}>{vault.name}</h3>
          <span className={styles.meta}>Creada {formatRelativeDate(vault.createdAt)}</span>
        </div>
        {completed && <Badge variant="success">Completada</Badge>}
        {vault.locked && <Badge variant="neutral">Bloqueada</Badge>}
      </div>

      <div className={styles.amounts}>
        <span className={styles.current}>{formatCurrency(vault.currentAmount, vault.currency)}</span>
        {hasTarget && (
          <span className={styles.target}>
            de {formatCurrency(vault.targetAmount as number, vault.currency)}
          </span>
        )}
      </div>

      {hasTarget ? (
        <Progress
          value={vault.currentAmount}
          max={vault.targetAmount}
          label="Progreso"
          showValue
        />
      ) : (
        <p className={styles.noTarget}>Sin objetivo definido</p>
      )}

      <div className={styles.footer}>
        <Button
          size="sm"
          variant="secondary"
          onClick={onTransfer}
          disabled={vault.locked}
          aria-label={`Añadir dinero a ${vault.name}`}
        >
          Añadir dinero
        </Button>
        <Switch
          checked={vault.locked}
          onChange={toggleLocked}
          disabled={updating}
          label={vault.locked ? 'Desbloquear bóveda' : 'Bloquear bóveda'}
        />
      </div>
    </Card>
  )
}
