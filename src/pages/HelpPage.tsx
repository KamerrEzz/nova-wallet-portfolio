import { motion } from 'framer-motion'

import { Card } from '@/shared/ui'

import { ContactForm } from './help/ContactForm'
import { ExportHistoryCard } from './help/ExportHistoryCard'
import { FaqAccordion } from './help/FaqAccordion'
import { SystemStatusCard } from './help/SystemStatusCard'
import styles from './help/HelpPage.module.css'

export default function HelpPage() {
  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <header className={styles.header}>
        <h1 className={styles.title}>Ayuda</h1>
        <p className={styles.subtitle}>
          Respuestas a las dudas más frecuentes y formas de contactar con nosotros.
        </p>
      </header>

      <div className={styles.grid}>
        <section className={styles.mainColumn} aria-label="Preguntas frecuentes y contacto">
          <Card padding="lg">
            <Card.Header>
              <h2 className={styles.sectionTitle}>Preguntas frecuentes</h2>
            </Card.Header>
            <Card.Body>
              <FaqAccordion />
            </Card.Body>
          </Card>

          <ContactForm />
        </section>

        <aside className={styles.sideColumn} aria-label="Herramientas y estado">
          <ExportHistoryCard />
          <SystemStatusCard />
        </aside>
      </div>
    </motion.div>
  )
}
