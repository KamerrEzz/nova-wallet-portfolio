import { useState } from 'react'

import { Button, Card, Modal } from '@/shared/ui'

import styles from './SecurityCard.module.css'

type DemoAction = 'password' | 'sessions' | null

const DEMO_COPY: Record<Exclude<DemoAction, null>, { title: string; body: string }> = {
  password: {
    title: 'Cambiar contraseña',
    body: 'Esta acción es ilustrativa en la demo. En una aplicación real aquí podrías actualizar tu contraseña de acceso.',
  },
  sessions: {
    title: 'Cerrar sesión en todos los dispositivos',
    body: 'Esta acción es ilustrativa en la demo. En una aplicación real se revocarían las sesiones activas en el resto de tus dispositivos.',
  },
}

export function SecurityCard() {
  const [demoAction, setDemoAction] = useState<DemoAction>(null)

  return (
    <Card padding="lg">
      <Card.Header>
        <h2 className={styles.title}>Seguridad</h2>
        <p className={styles.subtitle}>Gestiona el acceso a tu cuenta.</p>
      </Card.Header>
      <Card.Body>
        <ul className={styles.rows}>
          <li className={styles.row}>
            <div className={styles.rowText}>
              <span className={styles.rowLabel}>Contraseña</span>
              <span className={styles.rowHint}>••••••••</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setDemoAction('password')}>
              Cambiar
            </Button>
          </li>

          <li className={styles.row}>
            <div className={styles.rowText}>
              <span className={styles.rowLabel}>Sesiones activas</span>
              <span className={styles.device}>
                <span className={styles.deviceDot} aria-hidden="true" />
                Este dispositivo
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setDemoAction('sessions')}>
              Cerrar sesión en todos los dispositivos
            </Button>
          </li>
        </ul>
      </Card.Body>

      <Modal
        open={demoAction !== null}
        onClose={() => setDemoAction(null)}
        title={demoAction ? DEMO_COPY[demoAction].title : undefined}
        size="sm"
      >
        <p className={styles.modalBody}>{demoAction ? DEMO_COPY[demoAction].body : ''}</p>
      </Modal>
    </Card>
  )
}
