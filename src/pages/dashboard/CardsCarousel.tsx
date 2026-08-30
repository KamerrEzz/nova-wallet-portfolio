import { useGetCardsQuery } from '@/shared/api/apiSlice'
import { ErrorState, Skeleton } from '@/shared/ui'

import styles from './CardsCarousel.module.css'
import { WalletCard } from './WalletCard'

function CarouselSkeleton() {
  return (
    <div className={styles.track} aria-busy="true">
      {[0, 1].map((i) => (
        <div key={i} className={styles.item}>
          <Skeleton width="100%" height="100%" borderRadius={20} style={{ aspectRatio: '8 / 5' }} />
        </div>
      ))}
    </div>
  )
}

export function CardsCarousel() {
  const { data, isLoading, isError, refetch } = useGetCardsQuery()

  return (
    <section aria-labelledby="cards-heading">
      <h2 id="cards-heading" className={styles.heading}>
        Mis tarjetas
      </h2>
      {isLoading ? (
        <CarouselSkeleton />
      ) : isError || !data ? (
        <ErrorState
          title="No hemos podido cargar tus tarjetas"
          onRetry={refetch}
        />
      ) : (
        <div className={styles.track}>
          {data.map((card) => (
            <div key={card.id} className={styles.item}>
              <WalletCard card={card} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
