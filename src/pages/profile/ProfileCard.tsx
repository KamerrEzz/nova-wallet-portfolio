import { Avatar, Badge, Card } from '@/shared/ui'
import type { User } from '@/shared/types'

import styles from './ProfileCard.module.css'

interface ProfileCardProps {
  user: User
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <Card className={styles.card} padding="lg">
      <Avatar src={user.avatarUrl} name={user.name} size="lg" className={styles.avatar} />
      <div className={styles.identity}>
        <h2 className={styles.name}>{user.name}</h2>
        <p className={styles.email}>{user.email}</p>
        <Badge variant="success" dot>
          Cuenta verificada
        </Badge>
      </div>
    </Card>
  )
}
