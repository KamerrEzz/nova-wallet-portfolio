import { useEffect, useState } from 'react'

import { Badge, Card, Skeleton } from '@/shared/ui'

import styles from './SystemStatusCard.module.css'

const STATUS_DELAY_MS = 900

interface ServiceStatus {
  name: string
  operational: boolean
}

/** Estado simulado de los sistemas — siempre operativo en el entorno de demo. */
const MOCK_SERVICES: ServiceStatus[] = [
  { name: 'Pagos y transferencias', operational: true },
  { name: 'Tarjetas', operational: true },
  { name: 'Inicio de sesión', operational: true },
  { name: 'Notificaciones', operational: true },
]

/** Tarjeta con el estado (simulado) de la plataforma. */
export function SystemStatusCard() {
  const [loading, setLoading] = useState(true)

  // Simula una pequeña latencia de consulta al estado.
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), STATUS_DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Card padding="lg">
      <Card.Header>
        <div className={styles.headerRow}>
          <h2 className={styles.title}>Estado del sistema</h2>
          {!loading && (
            <Badge variant="success">
              <span className={styles.dot} aria-hidden="true" />
              Todo operativo
            </Badge>
          )}
        </div>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className={styles.skeletonList} aria-busy="true" aria-label="Comprobando el estado de los sistemas">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} height={18} />
            ))}
          </div>
        ) : (
          <ul className={styles.list} aria-label="Estado de los servicios">
            {MOCK_SERVICES.map((service) => (
              <li key={service.name} className={styles.row}>
                <span className={styles.serviceName}>{service.name}</span>
                <span className={styles.status}>
                  <span className={styles.dot} aria-hidden="true" />
                  Operativo
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card.Body>
    </Card>
  )
}
