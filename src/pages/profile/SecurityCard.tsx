import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { useAppDispatch } from '@/app/hooks'
import { addToast } from '@/features/ui/uiSlice'
import { useLocalStorage } from '@/shared/hooks'
import { formatRelativeDate } from '@/shared/lib/format'
import { Badge, Button, Card, Input, Switch } from '@/shared/ui'

import styles from './SecurityCard.module.css'

const MS_PER_DAY = 86_400_000
const daysAgo = (days: number) => new Date(Date.now() - days * MS_PER_DAY).toISOString()

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Introduce tu contraseña actual'),
    newPassword: z
      .string()
      .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
      .regex(/[A-ZÁÉÍÓÚÑ]/, 'Incluye al menos una letra mayúscula')
      .regex(/\d/, 'Incluye al menos un número'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

interface MockSession {
  id: string
  device: string
  detail: string
  /** ISO de la última actividad; `null` en la sesión actual. */
  lastActive: string | null
  current?: boolean
}

const MOCK_SESSIONS: MockSession[] = [
  {
    id: 'session-current',
    device: 'Este dispositivo',
    detail: 'Chrome · Windows · Madrid',
    lastActive: null,
    current: true,
  },
  {
    id: 'session-mobile',
    device: 'iPhone 15',
    detail: 'App Nova · Madrid',
    lastActive: daysAgo(1),
  },
  {
    id: 'session-tablet',
    device: 'iPad Air',
    detail: 'Safari · Valencia',
    lastActive: daysAgo(6),
  },
]

export function SecurityCard() {
  const dispatch = useAppDispatch()
  const [twoFactor, setTwoFactor] = useLocalStorage<boolean>('nova-2fa', false)
  const [sessions, setSessions] = useState<MockSession[]>(MOCK_SESSIONS)

  const passwordHeadingId = useId()
  const twoFactorLabelId = useId()
  const sessionsHeadingId = useId()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  // Mock: no hay endpoint real en la demo; se confirma con un toast.
  const onSubmit = handleSubmit(() => {
    dispatch(addToast({ kind: 'success', message: 'Contraseña actualizada (demo)' }))
    reset()
  })

  const handleTwoFactorChange = (enabled: boolean) => {
    setTwoFactor(enabled)
    dispatch(
      addToast({
        kind: 'info',
        message: enabled
          ? 'Verificación en dos pasos activada (demo)'
          : 'Verificación en dos pasos desactivada (demo)',
      }),
    )
  }

  const closeSession = (id: string) => {
    setSessions((previous) => previous.filter((session) => session.id !== id))
    dispatch(addToast({ kind: 'info', message: 'Sesión cerrada (demo)' }))
  }

  const closeOtherSessions = () => {
    setSessions((previous) => previous.filter((session) => session.current))
    dispatch(addToast({ kind: 'info', message: 'Se cerraron las demás sesiones (demo)' }))
  }

  return (
    <Card padding="lg">
      <Card.Header>
        <h2 className={styles.title}>Seguridad</h2>
        <p className={styles.subtitle}>Gestiona el acceso a tu cuenta.</p>
      </Card.Header>
      <Card.Body>
        <section className={styles.section} aria-labelledby={passwordHeadingId}>
          <h3 className={styles.sectionTitle} id={passwordHeadingId}>
            Cambiar contraseña
          </h3>
          <form className={styles.form} onSubmit={onSubmit} noValidate>
            <Input
              label="Contraseña actual"
              type="password"
              autoComplete="current-password"
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
            <Input
              label="Nueva contraseña"
              type="password"
              autoComplete="new-password"
              hint="Mínimo 8 caracteres, una mayúscula y un número."
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <Input
              label="Confirmar nueva contraseña"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <div className={styles.formActions}>
              <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
                Actualizar contraseña
              </Button>
            </div>
          </form>
        </section>

        <section className={styles.section} aria-labelledby={twoFactorLabelId}>
          <div className={styles.row}>
            <div className={styles.rowText}>
              <span className={styles.rowLabel} id={twoFactorLabelId}>
                Verificación en dos pasos (2FA)
              </span>
              <span className={styles.rowHint}>
                Te pediremos un código adicional al iniciar sesión.
              </span>
            </div>
            <Switch
              checked={twoFactor}
              onChange={handleTwoFactorChange}
              aria-label="Verificación en dos pasos"
            />
          </div>
        </section>

        <section className={styles.section} aria-labelledby={sessionsHeadingId}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle} id={sessionsHeadingId}>
              Sesiones activas
            </h3>
            {sessions.some((session) => !session.current) && (
              <Button variant="ghost" size="sm" onClick={closeOtherSessions}>
                Cerrar las demás sesiones
              </Button>
            )}
          </div>
          <ul className={styles.sessions}>
            {sessions.map((session) => (
              <li key={session.id} className={styles.sessionRow}>
                <div className={styles.rowText}>
                  <span className={styles.sessionName}>
                    <span className={styles.rowLabel}>{session.device}</span>
                    {session.current && (
                      <Badge variant="success" dot>
                        Sesión actual
                      </Badge>
                    )}
                  </span>
                  <span className={styles.rowHint}>
                    {session.detail}
                    {' · '}
                    {session.current
                      ? 'Activa ahora'
                      : `Última actividad: ${formatRelativeDate(session.lastActive ?? new Date())}`}
                  </span>
                </div>
                {!session.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => closeSession(session.id)}
                    aria-label={`Cerrar sesión en ${session.device}`}
                  >
                    Cerrar
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </section>
      </Card.Body>
    </Card>
  )
}
