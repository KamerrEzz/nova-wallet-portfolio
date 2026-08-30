import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { useContactSupportMutation } from '@/shared/api/apiSlice'
import { Button, Card, Input, Textarea } from '@/shared/ui'

import styles from './ContactForm.module.css'

const contactSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().trim().email('Introduce un correo válido'),
  subject: z.string().trim().min(4, 'El asunto debe tener al menos 4 caracteres'),
  message: z.string().trim().min(20, 'Cuéntanos un poco más (mínimo 20 caracteres)'),
})

type ContactFormValues = z.infer<typeof contactSchema>

/** Extrae el `{ message }` del cuerpo de error del servidor (`{status, data:{message}}`). */
function getServerMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: { message?: unknown } }).data
    if (data && typeof data.message === 'string') return data.message
  }
  return 'No se pudo enviar el mensaje'
}

export function ContactForm() {
  const [contactSupport, { isLoading }] = useContactSupportMutation()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', subject: '', message: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await contactSupport({
        subject: values.subject.trim(),
        message: `${values.message.trim()}\n\n— ${values.name.trim()} (${values.email.trim()})`,
      }).unwrap()
      reset()
    } catch (error) {
      // La mutación ya muestra un toast; aquí lo reflejamos también en el formulario.
      setError('root', { type: 'server', message: getServerMessage(error) })
    }
  })

  const busy = isSubmitting || isLoading

  return (
    <Card padding="lg">
      <Card.Header>
        <h2 className={styles.title}>Contacta con soporte</h2>
        <p className={styles.subtitle}>
          Cuéntanos tu problema y te responderemos por correo lo antes posible.
        </p>
      </Card.Header>
      <Card.Body>
        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div className={styles.row}>
            <Input
              label="Nombre"
              autoComplete="name"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <Input
            label="Asunto"
            placeholder="¿Sobre qué va tu consulta?"
            error={errors.subject?.message}
            {...register('subject')}
          />

          <Textarea
            label="Mensaje"
            rows={5}
            placeholder="Describe tu problema con el mayor detalle posible…"
            error={errors.message?.message}
            {...register('message')}
          />

          {errors.root && (
            <p className={styles.serverError} role="alert">
              {errors.root.message}
            </p>
          )}

          <div className={styles.actions}>
            <Button type="submit" variant="primary" loading={busy}>
              Enviar mensaje
            </Button>
          </div>
        </form>
      </Card.Body>
    </Card>
  )
}
