import styles from './MarqueeSection.module.css'

const ITEMS = [
  'Sin comisiones ocultas',
  'IBAN europeo',
  'Pagos instantáneos',
  'Cambio de divisa real',
  'Notificaciones en tiempo real',
  'Soporte humano 24/7',
] as const

/** Infinite pure-CSS marquee strip. The second list is a decorative duplicate. */
export function MarqueeSection() {
  return (
    <section className={styles.marquee} aria-label="Ventajas de NOVA">
      <div className={styles.track}>
        {[0, 1].map((dup) => (
          <ul key={dup} className={styles.list} aria-hidden={dup === 1 || undefined}>
            {ITEMS.map((item) => (
              <li key={item} className={styles.item}>
                <span className={styles.dot} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  )
}
