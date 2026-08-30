import { useExportTransactionsMutation } from '@/shared/api/apiSlice'
import { Button } from '@/shared/ui'

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
      <path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 21h16" />
    </svg>
  )
}

/** Botón de cabecera que descarga el historial de movimientos en CSV. */
export function ExportButton() {
  const [exportTransactions, { isLoading }] = useExportTransactionsMutation()

  const handleExport = () => {
    // La descarga la dispara onQueryStarted en apiSlice.
    void exportTransactions()
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      leftIcon={<DownloadIcon />}
      loading={isLoading}
      aria-label="Exportar movimientos a CSV"
      onClick={handleExport}
    >
      Exportar
    </Button>
  )
}
