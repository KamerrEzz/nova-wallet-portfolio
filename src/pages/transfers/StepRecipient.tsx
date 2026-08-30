import { useMemo, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { useGetRecipientsQuery } from '@/shared/api/apiSlice'
import { cn } from '@/shared/lib/cn'
import { Avatar, Button, EmptyState, ErrorState, Input, Skeleton } from '@/shared/ui'

import { getFavoriteRecipientIds } from './favorites'
import type { TransferFormValues } from './transferSchema'
import { useFocusHeading } from './useFocusHeading'
import styles from './transfers.module.css'

interface StepRecipientProps {
  form: UseFormReturn<TransferFormValues>
  onNext: () => void
}

/** Step 1 — pick a recipient from the list, with client-side search. */
export function StepRecipient({ form, onNext }: StepRecipientProps) {
  const headingRef = useFocusHeading<HTMLHeadingElement>()
  const { data: recipients, isLoading, isError, refetch } = useGetRecipientsQuery()
  const [search, setSearch] = useState('')

  const {
    setValue,
    watch,
    formState: { errors },
  } = form
  const selectedId = watch('recipientId')

  const query = search.trim().toLowerCase()
  const filtered = (recipients ?? []).filter(
    (user) =>
      user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
  )

  // Destinatarios frecuentes — últimos usados, leídos una vez por montaje del paso.
  const favoriteIds = useMemo(() => getFavoriteRecipientIds(), [])
  const favorites = favoriteIds
    .map((id) => recipients?.find((user) => user.id === id))
    .filter((user) => user !== undefined)

  const selectRecipient = (id: string) => {
    setValue('recipientId', id, { shouldValidate: true })
  }

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>
        <h2 ref={headingRef} tabIndex={-1} className={styles.stepTitle}>
          ¿A quién quieres enviar?
        </h2>
      </legend>

      {favorites.length > 0 && (
        <section className={styles.favorites} aria-label="Destinatarios frecuentes">
          <h3 className={styles.favoritesTitle}>Frecuentes</h3>
          <ul className={styles.favoritesList}>
            {favorites.map((user) => {
              const selected = user.id === selectedId
              return (
                <li key={user.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    title={user.name}
                    className={cn(styles.favoriteChip, selected && styles.selected)}
                    onClick={() => selectRecipient(user.id)}
                  >
                    <Avatar src={user.avatarUrl} name={user.name} size="sm" />
                    <span>{user.name.split(' ')[0]}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <Input
        label="Buscar destinatario"
        type="search"
        placeholder="Nombre o email"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {isLoading ? (
        <div aria-busy="true">
          {[0, 1, 2].map((index) => (
            <div key={index} className={styles.skeletonRow}>
              <Skeleton circle width={40} height={40} />
              <div className={styles.skeletonLines}>
                <Skeleton width="45%" height={14} />
                <Skeleton width="70%" height={12} />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="No hemos podido cargar tus destinatarios"
          description="Inténtalo de nuevo en unos segundos."
          onRetry={refetch}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={query ? `Sin resultados para “${search.trim()}”` : 'Aún no tienes destinatarios'}
          description={query ? 'Prueba con otro nombre o email.' : undefined}
        />
      ) : (
        <ul className={styles.recipientList}>
          {filtered.map((user) => {
            const selected = user.id === selectedId
            return (
              <li key={user.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  className={cn(styles.recipientButton, selected && styles.selected)}
                  onClick={() => selectRecipient(user.id)}
                >
                  <Avatar src={user.avatarUrl} name={user.name} />
                  <span className={styles.recipientInfo}>
                    <span className={styles.recipientName}>{user.name}</span>
                    <span className={styles.recipientEmail}>{user.email}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {errors.recipientId && (
        <p className={styles.error} role="alert">
          {errors.recipientId.message}
        </p>
      )}

      <div className={cn(styles.actions, styles.actionsEnd)}>
        <Button onClick={onNext} disabled={!selectedId}>
          Continuar
        </Button>
      </div>
    </fieldset>
  )
}
