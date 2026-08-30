import { useState } from 'react'
import { motion } from 'framer-motion'

import { Tabs } from '@/shared/ui'

import { AllocationDonut } from './investments/AllocationDonut'
import { InvestmentList } from './investments/InvestmentList'
import { PerformanceChart } from './investments/PerformanceChart'
import { PortfolioSummary } from './investments/PortfolioSummary'
import { SpendingInsightCard } from './investments/SpendingInsightCard'
import styles from './investments/InvestmentsPage.module.css'

const TABS = [
  { id: 'portfolio', label: 'Portafolio' },
  { id: 'performance', label: 'Rendimiento' },
  { id: 'insights', label: 'Insights' },
]

export default function InvestmentsPage() {
  const [activeTab, setActiveTab] = useState(TABS[0].id)

  const activeLabel = TABS.find((tab) => tab.id === activeTab)?.label ?? ''

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <header className={styles.header}>
        <h1 className={styles.title}>Inversiones</h1>
        <p className={styles.subtitle}>Sigue la evolución de tu portafolio</p>
      </header>

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'portfolio' && (
        <div role="tabpanel" aria-label={activeLabel} className={styles.panel}>
          <PortfolioSummary />
          <div className={styles.grid}>
            <InvestmentList />
            <AllocationDonut />
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div role="tabpanel" aria-label={activeLabel} className={styles.panel}>
          <PerformanceChart />
        </div>
      )}

      {activeTab === 'insights' && (
        <div role="tabpanel" aria-label={activeLabel} className={styles.panel}>
          <SpendingInsightCard />
        </div>
      )}
    </motion.div>
  )
}
