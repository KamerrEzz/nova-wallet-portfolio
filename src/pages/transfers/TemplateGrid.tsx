import { formatCurrency } from '@/shared/lib/format'
import { Avatar, Badge, Button } from '@/shared/ui'

import styles from './transfers.module.css'

export interface TransferTemplate {
  id: string
  name: string
  amount: number
  concept: string
  frequency: string
}

/** Mock de plantillas de transferencias recurrentes. */
export const TRANSFER_TEMPLATES: TransferTemplate[] = [
  { id: 'tpl-netflix', name: 'Netflix', amount: 12.99, concept: 'Suscripción Netflix', frequency: 'Mensual' },
  { id: 'tpl-alquiler', name: 'Alquiler', amount: 650, concept: 'Alquiler del piso', frequency: 'Mensual' },
  { id: 'tpl-gimnasio', name: 'Gimnasio', amount: 29.99, concept: 'Cuota del gimnasio', frequency: 'Mensual' },
  { id: 'tpl-luz', name: 'Luz y agua', amount: 85, concept: 'Suministros del hogar', frequency: 'Mensual' },
]

interface TemplateGridProps {
  /** Pre-rellena el asistente con la plantilla elegida. */
  onUse: (template: TransferTemplate) => void
}

/** Plantillas — transferencias recurrentes listas para reutilizar. */
export function TemplateGrid({ onUse }: TemplateGridProps) {
  return (
    <ul className={styles.templateList} aria-label="Plantillas de transferencias">
      {TRANSFER_TEMPLATES.map((template) => (
        <li key={template.id} className={styles.templateCard}>
          <Avatar name={template.name} />
          <span className={styles.templateInfo}>
            <span className={styles.templateName}>{template.name}</span>
            <span className={styles.templateMeta}>
              {formatCurrency(template.amount)} · {template.concept}
            </span>
          </span>
          <Badge variant="neutral">{template.frequency}</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUse(template)}
            aria-label={`Usar la plantilla ${template.name}`}
          >
            Usar
          </Button>
        </li>
      ))}
    </ul>
  )
}
