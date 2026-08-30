import { motion } from 'framer-motion'

import { useGetMeQuery } from '@/shared/api/apiSlice'
import { Card, ErrorState, Skeleton } from '@/shared/ui'

import { EditProfileForm } from './profile/EditProfileForm'
import { PreferencesCard } from './profile/PreferencesCard'
import { ProfileCard } from './profile/ProfileCard'
import { SecurityCard } from './profile/SecurityCard'
import styles from './profile/ProfilePage.module.css'

function ProfileSkeleton() {
  return (
    <>
      <Card padding="lg" className={styles.skeletonIdentity}>
        <Skeleton circle width={88} height={88} />
        <div className={styles.skeletonLines}>
          <Skeleton height="1.4em" width="55%" />
          <Skeleton height="1em" width="70%" />
          <Skeleton height="1.6em" width="35%" />
        </div>
      </Card>
      <Card padding="lg">
        <div className={styles.skeletonForm}>
          <Skeleton height="1.4em" width="40%" />
          <Skeleton height="2.8em" />
          <Skeleton height="2.8em" />
          <Skeleton height="2.4em" width="30%" />
        </div>
      </Card>
    </>
  )
}

export default function ProfilePage() {
  const { data: user, isLoading, isError, refetch } = useGetMeQuery()

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <header className={styles.header}>
        <h1 className={styles.title}>Perfil y ajustes</h1>
        <p className={styles.subtitle}>Gestiona tu cuenta, tu apariencia y tu seguridad.</p>
      </header>

      {isLoading ? (
        <ProfileSkeleton />
      ) : isError || !user ? (
        <Card padding="lg">
          <ErrorState
            title="No hemos podido cargar tu perfil"
            description="Comprueba tu conexión e inténtalo de nuevo."
            onRetry={() => refetch()}
          />
        </Card>
      ) : (
        <>
          <ProfileCard user={user} />
          <EditProfileForm user={user} />
        </>
      )}

      <PreferencesCard />
      <SecurityCard />
    </motion.div>
  )
}
