import type { Vault } from '@/shared/types'
import { formatCurrency } from '@/shared/lib/format'
import { Button, Skeleton, Stat } from '@/shared/ui'

import styles from './SavingsHeader.module.css'

export interface SavingsHeaderProps {
  vaults: Vault[] | undefined
  isLoading: boolean
  onCreateVault: () => void
}

export function SavingsHeader({ vaults, isLoading, onCreateVault }: SavingsHeaderProps) {
  const total = (vaults ?? []).reduce((sum, vault) => sum + vault.currentAmount, 0)
  const totalTarget = (vaults ?? []).reduce((sum, vault) => sum + (vault.targetAmount ?? 0), 0)
  const globalPct = totalTarget > 0 ? Math.min((total / totalTarget) * 100, 100) : 0

  return (
    <header className={styles.header}>
      <div className={styles.info}>
        <h1 className={styles.title}>Ahorros</h1>
        {isLoading ? (
          <div className={styles.skeletonWrap} aria-busy="true" aria-label="Cargando ahorros">
            <Skeleton width={220} height={40} borderRadius={10} />
            <Skeleton width={160} height={16} borderRadius={8} />
          </div>
        ) : (
          <div className={styles.stats}>
            <Stat label="Total ahorrado" value={total} />
            {totalTarget > 0 && (
              <p className={styles.targetNote}>
                {formatCurrency(total)} de {formatCurrency(totalTarget)} ·{' '}
                {Math.round(globalPct)}% del objetivo global
              </p>
            )}
          </div>
        )}
      </div>
      <Button onClick={onCreateVault} leftIcon={<span aria-hidden="true">＋</span>}>
        Nueva bóveda
      </Button>
    </header>
  )
}
