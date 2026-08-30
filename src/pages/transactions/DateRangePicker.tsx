import type { ChangeEvent } from 'react'

import { Input } from '@/shared/ui'

import styles from './DateRangePicker.module.css'

export interface DateRangePickerProps {
  /** `YYYY-MM-DD`, '' significa sin límite. */
  from: string
  to: string
  onChange: (patch: { from?: string; to?: string }) => void
}

/** Rango de fechas sencillo: dos inputs `date` en fila (Desde / Hasta). */
export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  const handleFrom = (event: ChangeEvent<HTMLInputElement>) => onChange({ from: event.target.value })
  const handleTo = (event: ChangeEvent<HTMLInputElement>) => onChange({ to: event.target.value })

  return (
    <div className={styles.range} role="group" aria-label="Rango de fechas">
      <Input
        className={styles.date}
        type="date"
        label="Desde"
        value={from}
        max={to || undefined}
        onChange={handleFrom}
      />
      <Input
        className={styles.date}
        type="date"
        label="Hasta"
        value={to}
        min={from || undefined}
        onChange={handleTo}
      />
    </div>
  )
}
