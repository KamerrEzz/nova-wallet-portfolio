import { useEffect, useId } from 'react'
import type { ReactNode } from 'react'

import { useLocalStorage } from '@/shared/hooks'
import { useTheme } from '@/shared/theme/ThemeContext'
import type { Theme } from '@/shared/theme/ThemeContext'
import { Card, Select, Switch } from '@/shared/ui'
import { formatCurrency } from '@/shared/lib/format'
import { cn } from '@/shared/lib/cn'

import { Toggle } from './Toggle'
import styles from './PreferencesCard.module.css'

type Currency = 'EUR' | 'USD' | 'MXN'
type Language = 'es' | 'en'
type DateFormat = 'dd-mm-yyyy' | 'mm-dd-yyyy' | 'iso'

interface NotificationPrefs {
  email: boolean
  push: boolean
  weekly: boolean
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

const THEME_OPTIONS: { value: Theme; label: string; icon: ReactNode }[] = [
  { value: 'dark', label: 'Oscuro', icon: <MoonIcon /> },
  { value: 'light', label: 'Claro', icon: <SunIcon /> },
]

export function PreferencesCard() {
  const { theme, setTheme } = useTheme()
  const [reducedMotion, setReducedMotion] = useLocalStorage<boolean>('nova-reduced-motion', false)
  const [currency, setCurrency] = useLocalStorage<Currency>('nova-currency', 'EUR')
  const [language, setLanguage] = useLocalStorage<Language>('nova-language', 'es')
  const [dateFormat, setDateFormat] = useLocalStorage<DateFormat>('nova-date-format', 'dd-mm-yyyy')
  const [notifications, setNotifications] = useLocalStorage<NotificationPrefs>(
    'nova-notifications',
    { email: true, push: true, weekly: false },
  )
  const reducedMotionLabelId = useId()
  const notificationsHeadingId = useId()

  // Refleja la preferencia en el documento (el CSS puede consumirla después).
  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.setAttribute('data-reduced-motion', 'true')
    } else {
      document.documentElement.removeAttribute('data-reduced-motion')
    }
  }, [reducedMotion])

  const updateNotifications = (key: keyof NotificationPrefs) => (enabled: boolean) => {
    setNotifications((previous) => ({ ...previous, [key]: enabled }))
  }

  return (
    <Card padding="lg">
      <Card.Header>
        <h2 className={styles.title}>Preferencias</h2>
        <p className={styles.subtitle}>Apariencia y visualización de la aplicación.</p>
      </Card.Header>
      <Card.Body>
        <div className={styles.rows}>
          <div className={styles.row}>
            <div className={styles.rowText}>
              <span className={styles.rowLabel}>Tema</span>
              <span className={styles.rowHint}>Elige entre modo oscuro y claro.</span>
            </div>
            <div className={styles.segmented} role="group" aria-label="Tema">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={theme === option.value}
                  className={cn(styles.segment, theme === option.value && styles.segmentActive)}
                  onClick={() => setTheme(option.value)}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.rowText}>
              <span className={styles.rowLabel} id={reducedMotionLabelId}>
                Movimiento reducido
              </span>
              <span className={styles.rowHint}>Reduce las animaciones de la interfaz.</span>
            </div>
            <Toggle
              checked={reducedMotion}
              onChange={setReducedMotion}
              aria-labelledby={reducedMotionLabelId}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.rowText}>
              <span className={styles.rowLabel}>Idioma</span>
              <span className={styles.rowHint}>Idioma de la interfaz (solo visual en esta demo).</span>
            </div>
            <Select
              aria-label="Idioma"
              className={styles.select}
              value={language}
              onChange={(event) => setLanguage(event.target.value as Language)}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </Select>
          </div>

          <div className={styles.row}>
            <div className={styles.rowText}>
              <span className={styles.rowLabel}>Moneda</span>
              <span className={styles.rowHint}>Divisa en la que se muestran los importes.</span>
            </div>
            <Select
              aria-label="Moneda"
              className={styles.select}
              value={currency}
              onChange={(event) => setCurrency(event.target.value as Currency)}
            >
              <option value="EUR">EUR — Euro (€)</option>
              <option value="USD">USD — Dólar ($)</option>
              <option value="MXN">MXN — Peso mexicano (MX$)</option>
            </Select>
          </div>
          <p className={styles.note}>
            Ejemplo: {formatCurrency(1530.75, currency)} · La conversión es solo visual en esta demo
          </p>

          <div className={styles.row}>
            <div className={styles.rowText}>
              <span className={styles.rowLabel}>Formato de fecha</span>
              <span className={styles.rowHint}>Cómo se muestran las fechas en la aplicación.</span>
            </div>
            <Select
              aria-label="Formato de fecha"
              className={styles.select}
              value={dateFormat}
              onChange={(event) => setDateFormat(event.target.value as DateFormat)}
            >
              <option value="dd-mm-yyyy">DD/MM/AAAA (31/12/2026)</option>
              <option value="mm-dd-yyyy">MM/DD/AAAA (12/31/2026)</option>
              <option value="iso">AAAA-MM-DD (2026-12-31)</option>
            </Select>
          </div>

          <h3 className={styles.groupTitle} id={notificationsHeadingId}>
            Notificaciones
          </h3>
          <div role="group" aria-labelledby={notificationsHeadingId} className={styles.rows}>
            <div className={styles.row}>
            <div className={styles.rowText}>
              <span className={styles.rowLabel}>Notificaciones por email</span>
              <span className={styles.rowHint}>Avisos de movimientos y seguridad en tu correo.</span>
            </div>
            <Switch
              checked={notifications.email}
              onChange={updateNotifications('email')}
              aria-label="Notificaciones por email"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.rowText}>
              <span className={styles.rowLabel}>Notificaciones push</span>
              <span className={styles.rowHint}>Avisos en tiempo real en tus dispositivos.</span>
            </div>
            <Switch
              checked={notifications.push}
              onChange={updateNotifications('push')}
              aria-label="Notificaciones push"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.rowText}>
              <span className={styles.rowLabel}>Resumen semanal</span>
              <span className={styles.rowHint}>Un resumen de tu actividad cada lunes.</span>
            </div>
            <Switch
              checked={notifications.weekly}
              onChange={updateNotifications('weekly')}
              aria-label="Resumen semanal"
            />
          </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}
