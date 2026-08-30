import { useState } from 'react'

import { useAppDispatch } from '@/app/hooks'
import { addToast } from '@/features/ui/uiSlice'
import { Button, Card, Modal } from '@/shared/ui'

import styles from './PrivacyCard.module.css'

export function PrivacyCard() {
  const dispatch = useAppDispatch()
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Mock: no hay exportación real en la demo; se confirma con un toast.
  const handleDownload = () => {
    dispatch(
      addToast({ kind: 'info', message: 'Preparando la descarga de tus datos (demo)' }),
    )
  }

  const handleDelete = () => {
    setConfirmOpen(false)
    dispatch(addToast({ kind: 'success', message: 'Tu cuenta se ha eliminado (demo)' }))
  }

  return (
    <Card padding="lg">
      <Card.Header>
        <h2 className={styles.title}>Privacidad</h2>
        <p className={styles.subtitle}>Controla tus datos y tu cuenta.</p>
      </Card.Header>
      <Card.Body>
        <div className={styles.row}>
          <div className={styles.rowText}>
            <span className={styles.rowLabel}>Tus datos</span>
            <span className={styles.rowHint}>
              Descarga una copia de tu información y tu actividad.
            </span>
          </div>
          <Button variant="secondary" size="sm" onClick={handleDownload}>
            Descargar mis datos
          </Button>
        </div>

        <div className={styles.dangerZone} role="region" aria-label="Zona de peligro">
          <div className={styles.rowText}>
            <span className={styles.dangerLabel}>Eliminar cuenta</span>
            <span className={styles.rowHint}>
              Esta acción es permanente y no se puede deshacer.
            </span>
          </div>
          <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
            Eliminar cuenta
          </Button>
        </div>
      </Card.Body>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="¿Eliminar tu cuenta?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Eliminar definitivamente
            </Button>
          </>
        }
      >
        <p className={styles.modalBody}>
          Se eliminarán tu perfil, tus cuentas y tu historial de forma permanente. Esta acción es
          ilustrativa en la demo.
        </p>
      </Modal>
    </Card>
  )
}
