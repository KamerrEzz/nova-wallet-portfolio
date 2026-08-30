import { useNavigate } from 'react-router-dom'

import { useMarkNotificationReadMutation } from '@/shared/api/apiSlice'
import { cn } from '@/shared/lib/cn'
import { formatRelativeDate } from '@/shared/lib/format'
import type { NotificationItem } from '@/shared/types'
import { Badge, Skeleton } from '@/shared/ui'
import type { BadgeVariant } from '@/shared/ui'

import styles from './NotificationList.module.css'

type NotificationType = NotificationItem['type']

const TYPE_META: Record<NotificationType, { label: string; badgeVariant: BadgeVariant }> = {
  transaction: { label: 'Transacción', badgeVariant: 'accent' },
  security: { label: 'Seguridad', badgeVariant: 'danger' },
  promo: { label: 'Novedad', badgeVariant: 'neutral' },
  system: { label: 'Sistema', badgeVariant: 'success' },
}

function TypeIcon({ type }: { type: NotificationType }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  } as const

  switch (type) {
    case 'transaction':
      return (
        <svg {...common}>
          <path d="m17 3 4 4-4 4" />
          <path d="M21 7H9" />
          <path d="m7 21-4-4 4-4" />
          <path d="M3 17h12" />
        </svg>
      )
    case 'security':
      return (
        <svg {...common}>
          <path d="M12 22s8-3.6 8-10V5.5L12 2 4 5.5V12c0 6.4 8 10 8 10Z" />
          <path d="m9 11.5 2 2 4-4.5" />
        </svg>
      )
    case 'promo':
      return (
        <svg {...common}>
          <path d="M12 3v3" />
          <path d="M12 18v3" />
          <path d="M3 12h3" />
          <path d="M18 12h3" />
          <path d="m5.6 5.6 2.1 2.1" />
          <path d="m16.3 16.3 2.1 2.1" />
          <path d="m5.6 18.4 2.1-2.1" />
          <path d="m16.3 7.7 2.1-2.1" />
        </svg>
      )
    case 'system':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8h.01" />
          <path d="M12 11v5" />
        </svg>
      )
  }
}

interface NotificationRowProps {
  notification: NotificationItem
}

function NotificationRow({ notification }: NotificationRowProps) {
  const navigate = useNavigate()
  const [markRead] = useMarkNotificationReadMutation()
  const meta = TYPE_META[notification.type]

  const handleClick = () => {
    if (!notification.read) {
      markRead(notification.id)
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
    }
  }

  return (
    <li>
      <button
        type="button"
        className={cn(styles.item, !notification.read && styles.unread)}
        onClick={handleClick}
        aria-label={`${notification.read ? '' : 'No leída: '}${notification.title}. Marcar como leída`}
      >
        <span className={cn(styles.icon, styles[`icon${notification.type}`])}>
          <TypeIcon type={notification.type} />
        </span>

        <span className={styles.content}>
          <span className={styles.heading}>
            <span className={styles.title}>{notification.title}</span>
            <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
          </span>
          <span className={styles.body}>{notification.body}</span>
          <span className={styles.meta}>
            <time dateTime={notification.createdAt}>{formatRelativeDate(notification.createdAt)}</time>
          </span>
        </span>

        {!notification.read && <span className={styles.dot} aria-hidden="true" />}
      </button>
    </li>
  )
}

export interface NotificationListProps {
  notifications: NotificationItem[]
}

export function NotificationList({ notifications }: NotificationListProps) {
  return (
    <ul className={styles.list} aria-label="Lista de notificaciones">
      {notifications.map((notification) => (
        <NotificationRow key={notification.id} notification={notification} />
      ))}
    </ul>
  )
}

export function NotificationListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul className={styles.list} aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <li key={index}>
          <div className={styles.item}>
            <Skeleton circle width={40} height={40} />
            <div className={styles.content}>
              <Skeleton width="40%" height="0.9em" />
              <Skeleton width="85%" height="0.8em" />
              <Skeleton width="25%" height="0.7em" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
