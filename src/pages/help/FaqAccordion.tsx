import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { cn } from '@/shared/lib/cn'

import styles from './FaqAccordion.module.css'

export interface FaqItem {
  question: string
  answer: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: '¿Cómo puedo enviar dinero a otro usuario?',
    answer:
      'Desde la sección Transferencias, introduce el correo o alias del destinatario, el importe y confirma la operación. El dinero llega al instante si el destinatario también usa NOVA.',
  },
  {
    question: '¿Cuánto tarda una transferencia a un banco externo?',
    answer:
      'Las transferencias a cuentas externas suelen completarse en 1-2 días laborables. Las transferencias entre usuarios de NOVA son inmediatas y sin comisiones.',
  },
  {
    question: '¿Cómo cambio mi divisa principal?',
    answer:
      'Ve a tu perfil y, en Preferencias, selecciona la divisa que quieras usar por defecto. Los importes de la app se mostrarán en esa divisa.',
  },
  {
    question: '¿Puedo exportar mis movimientos?',
    answer:
      'Sí. Desde esta página, en la tarjeta «Exportar historial», puedes descargar todos tus movimientos en formato CSV para abrirlos en tu hoja de cálculo favorita.',
  },
  {
    question: '¿Qué hago si veo un movimiento que no reconozco?',
    answer:
      'Contacta con nosotros cuanto antes desde el formulario de contacto indicando el movimiento sospechoso. Mientras tanto, cambia tu contraseña desde la sección de seguridad de tu perfil.',
  },
]

interface FaqAccordionProps {
  items?: FaqItem[]
}

/** Accordion de preguntas frecuentes con altura animada. */
export function FaqAccordion({ items = FAQ_ITEMS }: FaqAccordionProps) {
  const baseId = useId()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <ul className={styles.list}>
      {items.map((item, index) => {
        const open = openIndex === index
        const buttonId = `${baseId}-trigger-${index}`
        const panelId = `${baseId}-panel-${index}`

        return (
          <li key={item.question} className={cn(styles.item, open && styles.itemOpen)}>
            <button
              type="button"
              id={buttonId}
              className={styles.trigger}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenIndex(open ? null : index)}
            >
              <span className={styles.question}>{item.question}</span>
              <motion.svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={styles.chevron}
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <path d="m6 9 6 6 6-6" />
              </motion.svg>
            </button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  key="panel"
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={styles.panel}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <p className={styles.answer}>{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        )
      })}
    </ul>
  )
}
