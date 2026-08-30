import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'

import { BalanceCard } from './dashboard/BalanceCard'
import { CardsCarousel } from './dashboard/CardsCarousel'
import { DashboardHeader } from './dashboard/DashboardHeader'
import { MiniInsight } from './dashboard/MiniInsight'
import { QuickActions } from './dashboard/QuickActions'
import { RecentActivity } from './dashboard/RecentActivity'
import { SpendingChart } from './dashboard/SpendingChart'
import { UpcomingPayments } from './dashboard/UpcomingPayments'
import styles from './dashboard/DashboardPage.module.css'

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
}

export default function DashboardPage() {
  return (
    <motion.div
      className={styles.page}
      variants={container}
      initial="hidden"
      animate="show"
    >
      <DashboardHeader />
      <motion.div variants={item}>
        <QuickActions />
      </motion.div>
      <div className={styles.grid}>
        <div className={styles.column}>
          <motion.div variants={item}>
            <BalanceCard />
          </motion.div>
          <motion.div variants={item}>
            <MiniInsight />
          </motion.div>
          <motion.div variants={item}>
            <CardsCarousel />
          </motion.div>
        </div>
        <div className={styles.column}>
          <motion.div variants={item}>
            <SpendingChart />
          </motion.div>
          <motion.div variants={item}>
            <UpcomingPayments />
          </motion.div>
          <motion.div variants={item}>
            <RecentActivity />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
