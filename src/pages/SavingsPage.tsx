import { useState } from 'react'
import { motion } from 'framer-motion'

import { useGetVaultsQuery } from '@/shared/api/apiSlice'
import type { Vault } from '@/shared/types'
import { ErrorState } from '@/shared/ui'

import { AutoRulesCard } from './savings/AutoRulesCard'
import { CreateVaultModal } from './savings/CreateVaultModal'
import { GoalsSection } from './savings/GoalsSection'
import { GrowthChart } from './savings/GrowthChart'
import { SavingsHeader } from './savings/SavingsHeader'
import { TransferModal } from './savings/TransferModal'
import { VaultGrid } from './savings/VaultGrid'
import styles from './savings/SavingsPage.module.css'

export default function SavingsPage() {
  const { data: vaults, isLoading, isError, refetch } = useGetVaultsQuery()

  const [createOpen, setCreateOpen] = useState(false)
  const [transferVault, setTransferVault] = useState<Vault | null>(null)

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <SavingsHeader
        vaults={vaults}
        isLoading={isLoading}
        onCreateVault={() => setCreateOpen(true)}
      />

      {isError ? (
        <ErrorState
          title="No hemos podido cargar tus ahorros"
          description="Inténtalo de nuevo en unos segundos."
          onRetry={refetch}
        />
      ) : (
        <div className={styles.grid}>
          <div className={styles.column}>
            <VaultGrid
              vaults={vaults}
              isLoading={isLoading}
              onTransfer={setTransferVault}
              onCreateVault={() => setCreateOpen(true)}
            />
            <AutoRulesCard />
          </div>
          <div className={styles.column}>
            <GrowthChart vaults={vaults ?? []} isLoading={isLoading} />
            <GoalsSection vaults={vaults ?? []} />
          </div>
        </div>
      )}

      <CreateVaultModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <TransferModal vault={transferVault} onClose={() => setTransferVault(null)} />
    </motion.div>
  )
}
