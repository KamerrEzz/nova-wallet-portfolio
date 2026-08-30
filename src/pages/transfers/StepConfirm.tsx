import { cn } from '@/shared/lib/cn'
import { formatCurrency } from '@/shared/lib/format'
import type { User } from '@/shared/types'
import { Avatar, Button } from '@/shared/ui'

import type { TransferFormValues } from './transferSchema'
import { useFocusHeading } from './useFocusHeading'
import styles from './transfers.module.css'

interface StepConfirmProps {
  recipient: User
  values: TransferFormValues
  sending: boolean
  errorMessage: string | null
  onBack: () => void
  onConfirm: () => void
}

/** Step 3 — summary and confirmation. Server errors surface inline. */
export function StepConfirm({
  recipient,
  values,
  sending,
  errorMessage,
  onBack,
  onConfirm,
}: StepConfirmProps) {
  const headingRef = useFocusHeading<HTMLHeadingElement>()
  const concept = values.concept.trim()

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>
        <h2 ref={headingRef} tabIndex={-1} className={styles.stepTitle}>
          Confirma tu transferencia
        </h2>
      </legend>

      <div className={styles.recipientSummary}>
        <Avatar src={recipient.avatarUrl} name={recipient.name} size="lg" />
        <span className={styles.recipientInfo}>
          <span className={styles.recipientName}>{recipient.name}</span>
          <span className={styles.recipientEmail}>{recipient.email}</span>
        </span>
      </div>

      <p className={styles.summaryAmount}>{formatCurrency(values.amount)}</p>

      {concept && <p className={styles.summaryConcept}>“{concept}”</p>}

      <dl className={styles.summaryList}>
        <div className={styles.summaryRow}>
          <dt>Comisión</dt>
          <dd>0,00 €</dd>
        </div>
        <div className={cn(styles.summaryRow, styles.summaryTotal)}>
          <dt>Total</dt>
          <dd>{formatCurrency(values.amount)}</dd>
        </div>
      </dl>

      {errorMessage && (
        <div className={styles.alert} role="alert">
          <p className={styles.alertMessage}>{errorMessage}</p>
          <Button variant="ghost" size="sm" onClick={onBack}>
            Volver al importe
          </Button>
        </div>
      )}

      <div className={styles.actions}>
        <Button variant="ghost" onClick={onBack} disabled={sending}>
          Volver
        </Button>
        <Button onClick={onConfirm} loading={sending}>
          Confirmar transferencia
        </Button>
      </div>
    </fieldset>
  )
}
