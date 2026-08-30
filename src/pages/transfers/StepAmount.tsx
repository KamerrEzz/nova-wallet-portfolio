import type { UseFormReturn } from 'react-hook-form'

import { useGetBalanceQuery } from '@/shared/api/apiSlice'
import { formatCurrency } from '@/shared/lib/format'
import { Button, Input, Textarea } from '@/shared/ui'

import type { TransferFormValues } from './transferSchema'
import { useFocusHeading } from './useFocusHeading'
import styles from './transfers.module.css'

const QUICK_AMOUNTS = [10, 25, 50] as const
const CONCEPT_MAX = 140

interface StepAmountProps {
  form: UseFormReturn<TransferFormValues>
  onBack: () => void
  onNext: () => void
}

/** Step 2 — amount (validated against the available balance) and concept. */
export function StepAmount({ form, onBack, onNext }: StepAmountProps) {
  const headingRef = useFocusHeading<HTMLHeadingElement>()
  const { data: balance } = useGetBalanceQuery()

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form
  const concept = watch('concept')

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>
        <h2 ref={headingRef} tabIndex={-1} className={styles.stepTitle}>
          ¿Cuánto quieres enviar?
        </h2>
      </legend>

      <Input
        label="Importe"
        className={styles.amountField}
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        placeholder="0,00"
        leftIcon={<span aria-hidden="true">€</span>}
        hint={balance ? `Disponible: ${formatCurrency(balance.total, balance.currency)}` : undefined}
        error={errors.amount?.message}
        {...register('amount', { valueAsNumber: true })}
      />

      <div className={styles.chips}>
        {QUICK_AMOUNTS.map((value) => (
          <button
            key={value}
            type="button"
            className={styles.chip}
            onClick={() => setValue('amount', value, { shouldValidate: true })}
          >
            +{value} €
          </button>
        ))}
      </div>

      <div>
        <Textarea
          label="Concepto (opcional)"
          rows={3}
          maxLength={CONCEPT_MAX}
          placeholder="Ej.: Cena del sábado"
          error={errors.concept?.message}
          {...register('concept')}
        />
        <p className={styles.counter}>
          {concept.length}/{CONCEPT_MAX}
        </p>
      </div>

      <div className={styles.actions}>
        <Button variant="ghost" onClick={onBack}>
          Volver
        </Button>
        <Button onClick={onNext}>Continuar</Button>
      </div>
    </fieldset>
  )
}
