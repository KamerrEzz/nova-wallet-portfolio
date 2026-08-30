export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

export interface CardModel {
  id: string
  label: string
  last4: string
  holder: string
  expiry: string
  gradient: 'lime' | 'violet' | 'mono'
  type: 'physical' | 'virtual'
  status: 'active' | 'frozen' | 'expired'
  dailyLimit: number
  monthlyLimit: number
  contactless: boolean
  onlinePayments: boolean
}

export interface VirtualCard extends CardModel {
  type: 'virtual'
  disposable: boolean
  merchantLock?: string
}

export interface Vault {
  id: string
  name: string
  targetAmount?: number
  currentAmount: number
  currency: string
  icon?: string
  color?: string
  createdAt: string
  locked: boolean
}

export interface Goal {
  id: string
  vaultId: string
  name: string
  targetAmount: number
  targetDate: string
  autoRule?: 'roundup' | 'percentage' | 'fixed'
  autoValue?: number
}

export interface Investment {
  id: string
  symbol: string
  name: string
  type: 'stock' | 'etf' | 'crypto'
  quantity: number
  avgPrice: number
  currentPrice: number
  change24hPct: number
}

export interface NotificationItem {
  id: string
  type: 'transaction' | 'security' | 'promo' | 'system'
  title: string
  body: string
  read: boolean
  createdAt: string
  actionUrl?: string
}

export interface SpendingInsight {
  period: string
  totalSpent: number
  byCategory: Record<string, number>
  vsPreviousPeriodPct: number
}

export interface Transaction {
  id: string
  title: string
  category: string
  /** Negative amounts represent gastos (money out). */
  amount: number
  currency: string
  /** ISO 8601 date string. */
  date: string
  status: 'completed' | 'pending' | 'failed'
  counterparty?: string
}

export interface Balance {
  total: number
  currency: string
  monthlyChangePct: number
}
