import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { useAppDispatch } from '@/app/hooks'
import { addToast } from '@/features/ui/uiSlice'
import { useUpdateProfileMutation } from '@/shared/api/apiSlice'
import type { User } from '@/shared/types'
import { Avatar, Button, Card, Input, Modal } from '@/shared/ui'

import styles from './EditProfileForm.module.css'

const profileSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  avatarUrl: z.string().trim().url('Introduce una URL válida').or(z.literal('')).optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const SUCCESS_TIMEOUT_MS = 3000

/** Extrae el `{ message }` del cuerpo de error del servidor (`{status, data:{message}}`). */
function getServerMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: { message?: unknown } }).data
    if (data && typeof data.message === 'string') return data.message
  }
  return 'No se pudo actualizar el perfil'
}

interface EditProfileFormProps {
  user: User
}

export function EditProfileForm({ user }: EditProfileFormProps) {
  const dispatch = useAppDispatch()
  const [updateProfile, { isLoading }] = useUpdateProfileMutation()
  const [serverError, setServerError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [cropOpen, setCropOpen] = useState(false)
  const [cropZoom, setCropZoom] = useState(1)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', avatarUrl: '' },
  })

  // Rellena el formulario cuando llegan los datos del usuario (o cambian).
  useEffect(() => {
    reset({ name: user.name, avatarUrl: user.avatarUrl ?? '' })
  }, [user, reset])

  // Limpia el temporizador del mensaje de éxito al desmontar.
  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    }
  }, [])

  const watchedName = watch('name')
  const watchedAvatarUrl = watch('avatarUrl')

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    setSaved(false)
    try {
      await updateProfile({
        name: values.name.trim(),
        avatarUrl: values.avatarUrl?.trim() || undefined,
      }).unwrap()
      setSaved(true)
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
      savedTimerRef.current = setTimeout(() => setSaved(false), SUCCESS_TIMEOUT_MS)
    } catch (error) {
      setServerError(getServerMessage(error))
    }
  })

  const busy = isSubmitting || isLoading

  // Mock: el recorte es ilustrativo y no modifica la imagen.
  const handleApplyCrop = () => {
    setCropOpen(false)
    dispatch(addToast({ kind: 'info', message: 'Recorte aplicado (demo)' }))
  }

  return (
    <Card padding="lg">
      <Card.Header>
        <h2 className={styles.title}>Editar perfil</h2>
        <p className={styles.subtitle}>Actualiza tu nombre y tu imagen de perfil.</p>
      </Card.Header>
      <Card.Body>
        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <Input
            label="Nombre"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className={styles.avatarRow}>
            <div className={styles.avatarField}>
              <Input
                label="URL del avatar"
                type="url"
                placeholder="https://…"
                hint="Se muestra una vista previa en vivo."
                error={errors.avatarUrl?.message}
                {...register('avatarUrl')}
              />
            </div>
            <div className={styles.previewColumn}>
              <Avatar
                src={watchedAvatarUrl || undefined}
                name={watchedName || user.name}
                size="lg"
                className={styles.preview}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCropOpen(true)}
                aria-label="Recortar avatar"
              >
                Recortar
              </Button>
            </div>
          </div>

          {serverError && (
            <p className={styles.serverError} role="alert">
              {serverError}
            </p>
          )}
          {saved && (
            <p className={styles.success} role="status">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Perfil actualizado
            </p>
          )}

          <div className={styles.actions}>
            <Button type="submit" variant="primary" loading={busy}>
              Guardar cambios
            </Button>
          </div>
        </form>
      </Card.Body>

      <Modal
        open={cropOpen}
        onClose={() => setCropOpen(false)}
        title="Recortar avatar"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCropOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleApplyCrop}>
              Aplicar
            </Button>
          </>
        }
      >
        <div className={styles.cropArea}>
          <div className={styles.cropFrame}>
            <div
              className={styles.cropContent}
              style={{ transform: `scale(${cropZoom})` }}
            >
              <Avatar
                src={watchedAvatarUrl || undefined}
                name={watchedName || user.name}
                size="lg"
                className={styles.cropAvatar}
              />
            </div>
          </div>
        </div>
        <label className={styles.zoomRow}>
          <span className={styles.zoomLabel}>Zoom</span>
          <input
            type="range"
            min={1}
            max={2}
            step={0.05}
            value={cropZoom}
            onChange={(event) => setCropZoom(Number(event.target.value))}
            aria-label="Zoom del recorte"
            className={styles.zoomSlider}
          />
        </label>
        <p className={styles.cropHint}>
          El recorte es ilustrativo en esta demo; no modifica la imagen.
        </p>
      </Modal>
    </Card>
  )
}
