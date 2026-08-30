import { Link } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui'
import { Reveal } from './Reveal'
import styles from './CtaSection.module.css'

/** Final call to action: gradient-bordered glowing panel. */
export function CtaSection() {
  return (
    <section className={styles.section} aria-labelledby="cta-title">
      <div className={styles.container}>
        <Reveal>
          <div className={styles.glowWrap}>
            <div className={styles.panelBorder}>
              <div className={cn('grain', styles.panel)}>
                <h2 id="cta-title" className={styles.title}>
                  Tu cuenta, lista en dos minutos.
                </h2>
                <p className={styles.text}>
                  Sin papeleo, sin oficinas y sin letra pequeña. Abre tu cuenta NOVA y recibe tu
                  tarjeta física en casa.
                </p>
                <Link to="/register">
                  <Button size="lg">Empieza gratis</Button>
                </Link>
                <p className={styles.note}>Sin permanencia · Cancela cuando quieras</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
