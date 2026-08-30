import { z } from 'zod'

import { formatCurrency } from '@/shared/lib/format'

/**
 * Builds the wizard schema. The available balance is read lazily through
 * `getBalance` because the balance query may resolve after the form (and
 * its resolver) has been created.
 */
export function buildTransferSchema(getBalance: () => number | undefined) {
  return z.object({
    recipientId: z.string().min(1, 'Selecciona un destinatario'),
    amount: z
      .number({ invalid_type_error: 'Introduce un importe válido' })
      .positive('El importe debe ser mayor que cero')
      .superRefine((value, ctx) => {
        const balance = getBalance()
        if (balance !== undefined && value > balance) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Saldo insuficiente: dispones de ${formatCurrency(balance)}`,
          })
        }
      }),
    concept: z.string().max(140, 'Máximo 140 caracteres'),
  })
}

export type TransferFormValues = z.infer<ReturnType<typeof buildTransferSchema>>
