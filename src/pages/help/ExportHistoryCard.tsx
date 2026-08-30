import { useState } from 'react'

import { useExportTransactionsMutation } from '@/shared/api/apiSlice'
import { formatRelativeDate } from '@/shared/lib/format'
import { Button, Card, ErrorState } from '@/shared/ui'

import styles from './ExportHistoryCard.module.css'

function DownloadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  )
}

/** Tarjeta para descargar el historial de movimientos en CSV. */
export function ExportHistoryCard() {
  const [exportTransactions, { isLoading, isError, reset }] = useExportTransactionsMutation()
  const [lastExportAt, setLastExportAt] = useState<Date | null>(null)

  const handleExport = async () => {
    try {
      await exportTransactions().unwrap()
      setLastExportAt(new Date())
    } catch {
      // El estado de error de la mutación ya alimenta el ErrorState.
    }
  }

  return (
    <Card padding="lg">
      <Card.Header>
        <h2 className={styles.title}>Exportar historial</h2>
        <p className={styles.subtitle}>
          Descarga todos tus movimientos en formato CSV.
        </p>
      </Card.Header>
      <Card.Body>
        {isError ? (
          <ErrorState
            title="No se pudo generar el archivo"
            description="Inténtalo de nuevo en unos segundos."
            onRetry={() => {
              reset()
              void handleExport()
            }}
          />
        ) : (
          <div className={styles.content}>
            <Button
              variant="secondary"
              loading={isLoading}
              leftIcon={<DownloadIcon />}
              onClick={() => void handleExport()}
            >
              Descargar CSV
            </Button>
            <p className={styles.meta} role="status">
              {lastExportAt
                ? `Última exportación: ${formatRelativeDate(lastExportAt)}`
                : 'Aún no has exportado tu historial.'}
            </p>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}
