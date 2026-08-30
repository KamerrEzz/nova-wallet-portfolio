import { useMemo, useState } from 'react'

import type { Vault } from '@/shared/types'
import { Button, EmptyState, Skeleton, Tabs } from '@/shared/ui'

import { VaultCard } from './VaultCard'
import styles from './VaultGrid.module.css'

export interface VaultGridProps {
  vaults: Vault[] | undefined
  isLoading: boolean
  onTransfer: (vault: Vault) => void
  onCreateVault: () => void
}

type VaultFilter = 'all' | 'active' | 'done'

const FILTER_TABS = [
  { id: 'all', label: 'Todas' },
  { id: 'active', label: 'En progreso' },
  { id: 'done', label: 'Completadas' },
]

function isCompleted(vault: Vault): boolean {
  return vault.targetAmount !== undefined && vault.currentAmount >= vault.targetAmount
}

export function VaultGrid({ vaults, isLoading, onTransfer, onCreateVault }: VaultGridProps) {
  const [filter, setFilter] = useState<VaultFilter>('all')

  const filtered = useMemo(() => {
    const list = vaults ?? []
    if (filter === 'active') return list.filter((vault) => !isCompleted(vault))
    if (filter === 'done') return list.filter(isCompleted)
    return list
  }, [vaults, filter])

  let content
  if (isLoading) {
    content = (
      <div className={styles.grid} aria-busy="true" aria-label="Cargando bóvedas">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} width="100%" height={180} borderRadius={20} />
        ))}
      </div>
    )
  } else if (filtered.length === 0) {
    content = (
      <EmptyState
        title={filter === 'all' ? 'Aún no tienes bóvedas' : 'Nada por aquí'}
        description={
          filter === 'all'
            ? 'Crea tu primera bóveda y empieza a apartar dinero para lo que te importa.'
            : 'Ninguna bóveda coincide con este filtro.'
        }
        action={
          filter === 'all' ? (
            <Button variant="secondary" onClick={onCreateVault}>
              Crear bóveda
            </Button>
          ) : undefined
        }
      />
    )
  } else {
    content = (
      <ul className={styles.grid} aria-label="Tus bóvedas">
        {filtered.map((vault) => (
          <li key={vault.id}>
            <VaultCard vault={vault} onTransfer={() => onTransfer(vault)} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section aria-labelledby="vaults-heading" className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 id="vaults-heading" className={styles.heading}>
          Bóvedas
        </h2>
        <Tabs
          tabs={FILTER_TABS}
          activeTab={filter}
          onChange={(id) => setFilter(id as VaultFilter)}
        />
      </div>
      {content}
    </section>
  )
}
