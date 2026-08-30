import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'

import { useRegisterMutation } from '@/shared/api/apiSlice'
import { Button, Card, Input } from '@/shared/ui'

import styles from './RegisterPage.module.css'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Mínimo 2 caracteres'),
    email: z.string().email('Introduce un email válido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/\d/, 'Debe contener al menos un número'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

/** Extracts `{ data: { message } }` from a rejected RTK Query mutation. */
function getServerMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: { message?: unknown } }).data
    if (data && typeof data.message === 'string') return data.message
  }
  return fallback
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [registerUser, { isLoading }] = useRegisterMutation()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setServerError(null)
    try {
      await registerUser({ name, email, password }).unwrap()
      navigate('/app', { replace: true })
    } catch (error) {
      setServerError(getServerMessage(error, 'No se pudo crear la cuenta. Inténtalo de nuevo.'))
    }
  })

  return (
    <main className={`${styles.page} grain`}>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      >
        <Link to="/" className={styles.wordmark}>
          NOVA
        </Link>

        <Card glass padding="lg" className={styles.card}>
          <h1 className={styles.title}>Crea tu cuenta</h1>
          <p className={styles.subtitle}>Empieza a controlar tu dinero en minutos.</p>

          <div aria-live="assertive">
            {serverError && (
              <div className={styles.alert} role="alert">
                <span>{serverError}</span>
                <button
                  type="button"
                  className={styles.alertDismiss}
                  aria-label="Cerrar aviso"
                  onClick={() => setServerError(null)}
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <form className={styles.form} noValidate onSubmit={onSubmit}>
            <Input
              label="Nombre"
              type="text"
              autoComplete="name"
              placeholder="Ada Lovelace"
              autoFocus
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Contraseña"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres y un número"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
              Crear cuenta
            </Button>
          </form>
        </Card>

        <p className={styles.footer}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className={styles.link}>
            Entra
          </Link>
        </p>
      </motion.div>
    </main>
  )
}
