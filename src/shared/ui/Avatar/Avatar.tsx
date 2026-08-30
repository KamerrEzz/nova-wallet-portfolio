import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './Avatar.module.css'

export type AvatarSize = 'sm' | 'md' | 'lg'

export interface AvatarProps {
  /** Image URL. Falls back to initials when missing or failing to load. */
  src?: string
  /** Full name — used for initials and alt text. */
  name?: string
  size?: AvatarSize
  className?: string
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  return parts
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed
  const initials = name ? getInitials(name) : ''

  return (
    <span className={cn(styles.avatar, styles[size], className)}>
      {showImage ? (
        <img
          className={styles.image}
          src={src}
          alt={name ?? ''}
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-label={name}>{initials || '·'}</span>
      )}
    </span>
  )
}
