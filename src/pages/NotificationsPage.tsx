import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

import { useGetNotificationsQuery, useMarkAllNotificationsReadMutation } from '@/shared/api/apiSlice'
import type { NotificationItem } from '@/shared/types'
import { Badge, Button, EmptyState, ErrorState, Tabs } from '@/shared/ui'

import { NotificationList, NotificationListSkeleton } from './notifications/NotificationList'
import { NotificationPreferences } from './notifications/NotificationPreferences'
import styles from './notifications/NotificationsPage.module.css'

type NotificationFilter = 'all' | 'unread' | 'transactions' | 'security'

const FILTER_TABS = [
  { id: 'all', label: 'Todas' },
  { id: 'unread', label: 'No leídas' },
  { id: 'transactions', label: 'Transacciones' },
  { id: 'security', label: 'Seguridad' },
]

const EMPTY_MESSAGES: Record<NotificationFilter, { title: string; description: string }> = {
  all: { title: 'Sin notificaciones', description: 'Cuando haya novedades en tu cuenta las verás aquí.' },
  unread: { title: 'Todo al día', description: 'No tienes notificaciones sin leer.' },
  transactions: { title: 'Sin movimientos', description: 'No hay notificaciones de transacciones.' },
  security: { title: 'Sin avisos de seguridad', description: 'No hay alertas de seguridad en tu cuenta.' },
}

function matchesFilter(notification: NotificationItem, filter: NotificationFilter): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'unread':
      return !notification.read
    case 'transactions':
      return notification.type === 'transaction'
    case 'security':
      return notification.type === 'security'
  }
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<NotificationFilter>('all')

  const { data, isLoading, isFetching, isError, refetch } = useGetNotificationsQuery()
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation()

  const unreadCount = useMemo(() => data?.filter((n) => !n.read).length ?? 0, [data])

  const filtered = useMemo(
    () => (data ?? []).filter((notification) => matchesFilter(notification, filter)),
    [data, filter],
  )

  const showSkeleton = data === undefined && (isLoading || isFetching)

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <header className={styles.header}>
        <div className={styles.heading}>
          <h1 className={styles.title}>
            Notificaciones
            {unreadCount > 0 && (
              <Badge variant="accent" className={styles.countBadge}>
                {unreadCount} sin leer
              </Badge>
            )}
          </h1>
          <p className={styles.subtitle}>Mantente al tanto de la actividad de tu cuenta.</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => markAllRead()}
          loading={isMarkingAll}
          disabled={unreadCount === 0}
          aria-label="Marcar todas las notificaciones como leídas"
        >
          Marcar todo como leído
        </Button>
      </header>

      <Tabs tabs={FILTER_TABS} activeTab={filter} onChange={(id) => setFilter(id as NotificationFilter)} />

      {showSkeleton ? (
        <NotificationListSkeleton rows={5} />
      ) : isError || !data ? (
        <ErrorState title="No hemos podido cargar tus notificaciones" onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState title={EMPTY_MESSAGES[filter].title} description={EMPTY_MESSAGES[filter].description} />
      ) : (
        <NotificationList notifications={filtered} />
      )}

      <NotificationPreferences />
    </motion.div>
  )
}
