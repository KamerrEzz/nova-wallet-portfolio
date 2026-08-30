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
