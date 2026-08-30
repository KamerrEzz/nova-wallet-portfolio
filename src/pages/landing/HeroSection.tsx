import { Link } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import { usePrefersReducedMotion, useScrollProgress } from '@/shared/hooks'
import { Button } from '@/shared/ui'
import { BankCard3D } from './BankCard3D'
import { Reveal } from './Reveal'
import styles from './HeroSection.module.css'

/** Full-viewport hero: parallax copy + floating 3D card over gradient blobs. */
export function HeroSection() {
  const { scrollY } = useScrollProgress()
  const reducedMotion = usePrefersReducedMotion()

  // Parallax: copy lags behind scroll, the card drifts at a slower rate.
  const copyShift = reducedMotion ? 0 : Math.min(scrollY * 0.18, 180)
  const cardShift = reducedMotion ? 0 : Math.min(scrollY * 0.07, 70)

  return (
    <section className={cn('grain', styles.hero)} aria-labelledby="hero-title">
      <div className={cn(styles.blob, styles.blobLime)} aria-hidden="true" />
      <div className={cn(styles.blob, styles.blobViolet)} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.copy} style={{ transform: `translate3d(0, ${copyShift}px, 0)` }}>
          <Reveal>
            <p className={styles.eyebrow}>Banca phygital</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 id="hero-title" className={styles.title}>
              Tu dinero, <span className={styles.titleAccent}>en físico y en digital.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className={styles.sub}>
              NOVA une tu tarjeta física y tu cuenta digital en una sola experiencia: gasta, envía y
              controla tu dinero sin fricción y sin letra pequeña.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className={styles.ctas}>
              <Link to="/register">
                <Button size="lg">Crear cuenta</Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="ghost">
                  Ver demo
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>

        <div className={styles.visual} style={{ transform: `translate3d(0, ${cardShift}px, 0)` }}>
          <div className={styles.cardGlow} aria-hidden="true" />
          <Reveal delay={0.2}>
            <BankCard3D variant="lime" float />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
