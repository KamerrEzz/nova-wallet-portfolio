import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { useInView, usePrefersReducedMotion } from '@/shared/hooks'
import { Card } from '@/shared/ui'
import { Reveal } from './Reveal'
import styles from './FeaturesSection.module.css'

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 140, damping: 22 },
  },
}

function ControlIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" focusable="false">
      <path d="M4 8h10M18 8h2M4 16h2M10 16h10" />
      <circle cx="16" cy="8" r="2" />
      <circle cx="8" cy="16" r="2" />
    </svg>
  )
}

function BoltIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
    </svg>
  )
}

function CardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" focusable="false">
      <rect x="2.5" y="5" width="19" height="14" rx="3" />
      <path d="M2.5 10h19M6.5 15h4" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M12 3 5 6v5c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6l-7-3z" />
      <path d="m9.5 11.5 2 2 3.5-4" />
    </svg>
  )
}

const FEATURES = [
  {
    title: 'Control total',
    text: 'Límites, congelado y notificaciones al instante. Tu tarjeta obedece desde la app, no al revés.',
    Icon: ControlIcon,
  },
  {
    title: 'Transferencias instantáneas',
    text: 'Envía y recibe euros en segundos, cualquier día a cualquier hora, sin esperas absurdas.',
    Icon: BoltIcon,
  },
  {
    title: 'Tarjetas inteligentes',
    text: 'Física, virtual o desechable: crea la tarjeta que necesitas para cada compra en un toque.',
    Icon: CardIcon,
  },
  {
    title: 'Privacidad primero',
    text: 'Tus datos son tuyos. Cifrado extremo a extremo y cero venta de información a terceros.',
    Icon: ShieldIcon,
  },
] as const

/** Scroll-reveal staggered grid of the four core product pillars. */
export function FeaturesSection() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.15 })
  const reducedMotion = usePrefersReducedMotion()

  return (
    <section id="producto" className={styles.section} aria-labelledby="features-title">
      <div className={styles.container}>
        <Reveal className={styles.header}>
          <p className={styles.eyebrow}>Producto</p>
          <h2 id="features-title" className={styles.title}>
            Todo lo que esperas de tu banco. Nada de lo que odias.
          </h2>
          <p className={styles.sub}>
            Una cuenta diseñada para que el dinero deje de ser una preocupación y vuelva a ser una
            herramienta.
          </p>
        </Reveal>

        <motion.div
          ref={ref}
          className={styles.grid}
          variants={listVariants}
          initial={reducedMotion ? false : 'hidden'}
          animate={reducedMotion || inView ? 'visible' : 'hidden'}
        >
          {FEATURES.map(({ title, text, Icon }) => (
            <motion.div key={title} variants={itemVariants}>
              <Card glass hover padding="lg" className={styles.featureCard}>
                <span className={styles.iconWrap}>
                  <Icon />
                </span>
                <h3 className={styles.featureTitle}>{title}</h3>
                <p className={styles.featureText}>{text}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
