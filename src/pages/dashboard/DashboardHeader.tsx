import { useNavigate } from 'react-router-dom'

import { useAppSelector } from '@/app/hooks'
import { selectCurrentUser } from '@/features/auth/authSlice'
import { useGetMeQuery } from '@/shared/api/apiSlice'
import { formatDate } from '@/shared/lib/format'
import { Button, ThemeToggle } from '@/shared/ui'

import styles from './DashboardHeader.module.css'

export function DashboardHeader() {
  const navigate = useNavigate()
  const authUser = useAppSelector(selectCurrentUser)
  const { data: me } = useGetMeQuery(undefined, { skip: authUser !== null })
  const user = authUser ?? me ?? null
  const firstName = user?.name.trim().split(/\s+/)[0] ?? ''

  const today = formatDate(new Date(), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <header className={styles.header}>
      <div className={styles.text}>
        <h1 className={styles.greeting}>Hola, {firstName || 'bienvenido'}</h1>
        <p className={styles.date}>{today}</p>
      </div>
      <div className={styles.actions}>
        <ThemeToggle />
        <Button onClick={() => navigate('/app/transfers')}>Transferir</Button>
      </div>
    </header>
  )
}
