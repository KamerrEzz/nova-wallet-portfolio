import { motion } from 'framer-motion'

import { BalanceCard } from './dashboard/BalanceCard'
import { CardsCarousel } from './dashboard/CardsCarousel'
import { DashboardHeader } from './dashboard/DashboardHeader'
import { RecentActivity } from './dashboard/RecentActivity'
import { SpendingChart } from './dashboard/SpendingChart'
import styles from './dashboard/DashboardPage.module.css'

export default function DashboardPage() {
  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <DashboardHeader />
      <div className={styles.grid}>
        <div className={styles.column}>
          <BalanceCard />
          <CardsCarousel />
        </div>
        <div className={styles.column}>
          <SpendingChart />
          <RecentActivity />
        </div>
      </div>
    </motion.div>
  )
}
