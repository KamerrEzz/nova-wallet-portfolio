import type { CardModel } from '@/shared/types'
import type { BadgeVariant } from '@/shared/ui'

export const STATUS_LABEL: Record<CardModel['status'], string> = {
  active: 'Activa',
  frozen: 'Congelada',
  expired: 'Caducada',
}

export const STATUS_VARIANT: Record<CardModel['status'], BadgeVariant> = {
  active: 'success',
  frozen: 'neutral',
  expired: 'danger',
}

/** Parses an "MM/YY" expiry into the last day of that month. Returns null when malformed. */
export function expiryToDate(expiry: string): Date | null {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry.trim())
  if (!match) return null
  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  if (month < 1 || month > 12) return null
  return new Date(year, month, 0)
}
