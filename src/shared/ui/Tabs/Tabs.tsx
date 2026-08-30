import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'
import styles from './Tabs.module.css'

export interface TabItem {
  id: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}

export interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div role="tablist" className={cn(styles.root, className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-disabled={tab.disabled || undefined}
            disabled={tab.disabled}
            className={cn(styles.tab, isActive && styles.active, tab.disabled && styles.disabled)}
            onClick={() => onChange(tab.id)}
          >
            {tab.icon && (
              <span className={styles.icon} aria-hidden="true">
                {tab.icon}
              </span>
            )}
            {tab.label}
            {isActive && <motion.span layoutId="tab-underline" className={styles.underline} />}
          </button>
        )
      })}
    </div>
  )
}
