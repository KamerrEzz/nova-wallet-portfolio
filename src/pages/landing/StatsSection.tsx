import { Stat } from '@/shared/ui'
import { Reveal } from './Reveal'
import styles from './StatsSection.module.css'

/** Animated count-up stats, driven by the shared Stat component. */
export function StatsSection() {
  return (
    <section className={styles.section} aria-label="NOVA en cifras">
      <div className={styles.container}>
        <div className={styles.grid}>
          <Reveal>
            <Stat label="Usuarios" value={120} formatValue={(v) => `${Math.round(v)}K`} />
          </Reveal>
          <Reveal delay={0.1}>
            <Stat label="Movidos con NOVA" value={48} formatValue={(v) => `€${Math.round(v)}M`} />
          </Reveal>
          <Reveal delay={0.2}>
            <Stat label="Valoración media" value={4.9} formatValue={(v) => v.toFixed(1)} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
