import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

import styles from './RouteError.module.css'

export default function RouteError() {
  const error = useRouteError()

  console.error('[RouteError]', error)

  const detail = isRouteErrorResponse(error)
    ? `${error.status} · ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Error inesperado'

  return (
    <main className={styles.root}>
      <h1 className={styles.title}>Algo salió mal</h1>
      <p className={styles.text}>No pudimos cargar esta página.</p>
      <p className={styles.detail}>{detail}</p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primary}
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
        <Link to="/" className={styles.secondary}>
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
