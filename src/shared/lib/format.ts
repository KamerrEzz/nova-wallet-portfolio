const currencyFormatters = new Map<string, Intl.NumberFormat>()

/** Formats a number as currency, es-ES locale. Defaults to EUR. */
export function formatCurrency(amount: number, currency = 'EUR'): string {
  let formatter = currencyFormatters.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat('es-ES', { style: 'currency', currency })
    currencyFormatters.set(currency, formatter)
  }
  return formatter.format(amount)
}

/** Formats an ISO date string or Date, es-ES locale (e.g. "12 mar 2026"). */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' },
): string {
  return new Intl.DateTimeFormat('es-ES', options).format(new Date(date))
}

const MS_PER_DAY = 86_400_000

/** Formats a date relative to today in Spanish: "hoy", "ayer", "hace 3 días", or a full date. */
export function formatRelativeDate(date: string | Date): string {
  const target = new Date(date)
  const now = new Date()

  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate())
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.round((startOfTarget.getTime() - startOfNow.getTime()) / MS_PER_DAY)

  if (Math.abs(diffDays) >= 30) {
    return formatDate(target)
  }

  return new Intl.RelativeTimeFormat('es-ES', { numeric: 'auto' }).format(diffDays, 'day')
}
