import { useElementScrollProgress, useMediaQuery, usePrefersReducedMotion } from '@/shared/hooks'
import { Badge } from '@/shared/ui'
import { BankCard3D } from './BankCard3D'
import type { BankCardVariant } from './BankCard3D'
import { Reveal } from './Reveal'
import styles from './CardShowcaseSection.module.css'

const CARD_VARIANTS: BankCardVariant[] = ['lime', 'violet', 'mono']

/**
 * "Phygital" story: sticky copy on the left, a stack of card variants on the
 * right that fans out as the section travels through the viewport.
 */
export function CardShowcaseSection() {
  const { ref, progress } = useElementScrollProgress<HTMLDivElement>()
  const isDesktop = useMediaQuery('(min-width: 900px)')
  const reducedMotion = usePrefersReducedMotion()

  // Fan only applies to the absolute-positioned desktop stack. Under reduced
  // motion the fan rests at a fixed, fully visible spread.
  const spread = isDesktop ? (reducedMotion ? 0.65 : progress) : 0

  return (
    <section id="tarjeta" className={styles.section} aria-labelledby="showcase-title">
      <div ref={ref} className={styles.container}>
        <div className={styles.copyCol}>
          <div className={styles.sticky}>
            <Reveal>
              <p className={styles.eyebrow}>La tarjeta</p>
              <h2 id="showcase-title" className={styles.title}>
                Una tarjeta, dos mundos.
              </h2>
              <p className={styles.text}>
                La tarjeta física NOVA vive en tu cartera; su gemela digital vive en la app. Lo que
                tocas en una se refleja al instante en la otra: congela, limita o renueva sin
                llamadas ni esperas.
              </p>
              <ul className={styles.chips}>
                <li>
                  <Badge variant="accent">Tarjeta física gratuita</Badge>
                </li>
                <li>
                  <Badge variant="accent">Congélala en un toque</Badge>
                </li>
                <li>
                  <Badge variant="accent">Pagos sin contacto</Badge>
                </li>
              </ul>
            </Reveal>
          </div>
        </div>

        <div className={styles.cardsCol}>
          {CARD_VARIANTS.map((variant, index) => {
            const offset = index - 1
            const transform = `translate3d(${offset * spread * 88}px, ${
              Math.abs(offset) * spread * 14 + index * 4
            }px, 0) rotate(${offset * spread * 7}deg)`
            return (
              <div
                key={variant}
                className={styles.cardSlot}
                style={{ transform, zIndex: 3 - Math.abs(offset) }}
              >
                <BankCard3D variant={variant} tilt={false} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
