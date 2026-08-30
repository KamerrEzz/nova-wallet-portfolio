import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useLoginMutation } from '@/shared/api/apiSlice'
import { Button, Card, Input } from '@/shared/ui'

import styles from './LoginPage.module.css'

const loginSchema = z.object({
  email: z.string().email('Introduce un email válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginFormValues = z.infer<typeof loginSchema>

/** Extracts `{ data: { message } }` from a rejected RTK Query mutation. */
function getServerMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: { message?: unknown } }).data
    if (data && typeof data.message === 'string') return data.message
  }
  return fallback
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [login, { isLoading }] = useLoginMutation()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      await login(values).unwrap()
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
      navigate(from ?? '/app', { replace: true })
    } catch (error) {
      setServerError(getServerMessage(error, 'No se pudo iniciar sesión. Inténtalo de nuevo.'))
    }
  })

  const fillDemo = () => {
    setValue('email', 'demo@nova.app')
    setValue('password', 'demo1234')
    setServerError(null)
  }

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
          <h1 className={styles.title}>Bienvenido de nuevo</h1>
          <p className={styles.subtitle}>Entra para ver tu saldo y tus movimientos.</p>

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
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              autoFocus
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
              Entrar
            </Button>
          </form>

          <div className={styles.demo}>
            <p className={styles.demoText}>
              Demo: <code>demo@nova.app</code> / <code>demo1234</code>
            </p>
            <Button type="button" variant="ghost" size="sm" onClick={fillDemo}>
              Rellenar demo
            </Button>
          </div>
        </Card>

        <p className={styles.footer}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" className={styles.link}>
            Crea una
          </Link>
        </p>
      </motion.div>
    </main>
  )
}
