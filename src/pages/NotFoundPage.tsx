import { Link } from 'react-router-dom'

import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <main className={styles.root}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Página no encontrada</h1>
      <p className={styles.text}>La ruta que buscas no existe o fue movida.</p>
      <Link to="/" className={styles.link}>
        Volver al inicio
      </Link>
    </main>
  )
}
