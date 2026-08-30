import { Spinner } from '@/shared/ui'

import styles from './FullScreenLoader.module.css'

interface FullScreenLoaderProps {
  label?: string
}

/** Full-viewport loading state built on the design-system Spinner. */
export default function FullScreenLoader({ label = 'Cargando…' }: FullScreenLoaderProps) {
  return (
    <div className={styles.root}>
      <Spinner size="lg" label={label} />
      <span className={styles.label}>{label}</span>
    </div>
  )
}
