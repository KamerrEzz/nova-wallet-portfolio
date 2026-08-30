import { Avatar, Card } from '@/shared/ui'
import { Reveal } from './Reveal'
import styles from './TestimonialsSection.module.css'

const TESTIMONIALS = [
  {
    name: 'Marta Gil',
    role: 'Diseñadora de producto',
    quote:
      'Congelé la tarjeta desde el metro y la descongelé en la tienda. Así, sin más. Ningún banco me había dado esa sensación de control.',
  },
  {
    name: 'Diego Ferrer',
    role: 'Desarrollador freelance',
    quote:
      'Cobro en tres divisas y NOVA me hace el cambio al tipo real. Dejé de mirar la letra pequeña porque simplemente no la hay.',
  },
  {
    name: 'Lucía Sanz',
    role: 'Fundadora, Studio Norte',
    quote:
      'Las tarjetas virtuales desechables para suscripciones son oro puro. Sé exactamente qué se cobra, cuándo y de dónde.',
  },
] as const

/** Horizontal scroll-snap row of glass testimonial cards. */
export function TestimonialsSection() {
  return (
    <section id="opiniones" className={styles.section} aria-labelledby="testimonials-title">
      <div className={styles.container}>
        <Reveal className={styles.header}>
          <p className={styles.eyebrow}>Opiniones</p>
          <h2 id="testimonials-title" className={styles.title}>
            Lo que dicen quienes ya usan NOVA.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className={styles.row}>
            {TESTIMONIALS.map(({ name, role, quote }) => (
              <li key={name} className={styles.item}>
                <Card glass padding="lg" className={styles.card}>
                  <blockquote className={styles.quote}>“{quote}”</blockquote>
                  <div className={styles.person}>
                    <Avatar name={name} />
                    <div>
                      <p className={styles.name}>{name}</p>
                      <p className={styles.role}>{role}</p>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
