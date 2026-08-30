import { useState } from 'react'

import { Card, Switch } from '@/shared/ui'

import styles from './NotificationPreferences.module.css'

interface Preference {
  id: string
  label: string
  description: string
  enabled: boolean
}

const INITIAL_PREFERENCES: Preference[] = [
  {
    id: 'push',
    label: 'Notificaciones push',
    description: 'Recibe avisos en tiempo real en este dispositivo.',
    enabled: true,
  },
  {
    id: 'email',
    label: 'Alertas por correo',
    description: 'Te enviamos los movimientos importantes a tu email.',
    enabled: true,
  },
  {
    id: 'security',
    label: 'Alertas de seguridad',
    description: 'Inicios de sesión y cambios en tu cuenta. Recomendado.',
    enabled: true,
  },
  {
    id: 'weekly',
    label: 'Resumen semanal',
    description: 'Un resumen de tu actividad cada lunes por la mañana.',
    enabled: false,
  },
]

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<Preference[]>(INITIAL_PREFERENCES)

  const toggle = (id: string, enabled: boolean) => {
    setPreferences((prev) => prev.map((p) => (p.id === id ? { ...p, enabled } : p)))
  }

  return (
    <Card role="group" aria-labelledby="notification-preferences-title">
      <Card.Header className={styles.header}>
        <h2 id="notification-preferences-title" className={styles.title}>
          Preferencias
        </h2>
        <p className={styles.subtitle}>Elige cómo y cuándo quieres que te avisemos.</p>
      </Card.Header>
      <Card.Body className={styles.body}>
        <ul className={styles.list}>
          {preferences.map((preference) => (
            <li key={preference.id} className={styles.row}>
              <div className={styles.text}>
                <span className={styles.label}>{preference.label}</span>
                <span className={styles.description}>{preference.description}</span>
              </div>
              <Switch
                checked={preference.enabled}
                onChange={(checked) => toggle(preference.id, checked)}
                label={preference.label}
                className={styles.switchControl}
              />
            </li>
          ))}
        </ul>
      </Card.Body>
    </Card>
  )
}
