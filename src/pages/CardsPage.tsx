import { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

import { useGetCardsQuery } from '@/shared/api/apiSlice'
import type { CardModel } from '@/shared/types'
import { Button, EmptyState, ErrorState, Tabs } from '@/shared/ui'

import { CardDetailsDrawer } from './cards/CardDetailsDrawer'
import { CardLimitsModal } from './cards/CardLimitsModal'
import { CardsGrid, CardsGridSkeleton } from './cards/CardsGrid'
import { CardsHistory } from './cards/CardsHistory'
import { CreateVirtualCardModal } from './cards/CreateVirtualCardModal'
import styles from './cards/CardsPage.module.css'

type CardsTab = 'mine' | 'virtual' | 'history'

const TABS = [
  { id: 'mine', label: 'Mis tarjetas' },
  { id: 'virtual', label: 'Virtuales' },
  { id: 'history', label: 'Historial' },
]

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export default function CardsPage() {
  const [activeTab, setActiveTab] = useState<CardsTab>('mine')
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [limitsCardId, setLimitsCardId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const { data: cards, isLoading, isFetching, isError, refetch } = useGetCardsQuery()

  const physicalCards = useMemo(() => (cards ?? []).filter((card) => card.type === 'physical'), [cards])
  const virtualCards = useMemo(() => (cards ?? []).filter((card) => card.type === 'virtual'), [cards])

  // Derive from the query cache so edits are reflected immediately.
  const selectedCard = useMemo(
    () => cards?.find((card) => card.id === selectedCardId) ?? null,
    [cards, selectedCardId],
  )
  const limitsCard = useMemo(
    () => cards?.find((card) => card.id === limitsCardId) ?? null,
    [cards, limitsCardId],
  )

  const handleSelect = useCallback((card: CardModel) => setSelectedCardId(card.id), [])
  const handleCloseDetails = useCallback(() => setSelectedCardId(null), [])
  const handleEditLimits = useCallback((card: CardModel) => setLimitsCardId(card.id), [])
  const handleCloseLimits = useCallback(() => setLimitsCardId(null), [])

  // From the drawer: close it first so only one overlay stays open.
  const handleEditLimitsFromDrawer = useCallback((card: CardModel) => {
    setSelectedCardId(null)
    setLimitsCardId(card.id)
  }, [])

  const showSkeleton = cards === undefined && (isLoading || isFetching)
  const visibleCards = activeTab === 'virtual' ? virtualCards : physicalCards

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Tarjetas</h1>
          <p className={styles.subtitle}>
            {cards ? `${cards.length} ${cards.length === 1 ? 'tarjeta' : 'tarjetas'}` : 'Cargando tarjetas…'}
          </p>
        </div>
        <Button leftIcon={<PlusIcon />} onClick={() => setCreateOpen(true)}>
          Nueva tarjeta virtual
        </Button>
      </header>

      <Tabs
        tabs={TABS}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as CardsTab)}
        className={styles.tabs}
      />

      {showSkeleton ? (
        <CardsGridSkeleton />
      ) : isError || !cards ? (
        <ErrorState title="No hemos podido cargar tus tarjetas" onRetry={refetch} />
      ) : activeTab === 'history' ? (
        <CardsHistory cards={cards} />
      ) : visibleCards.length === 0 ? (
        activeTab === 'virtual' ? (
          <EmptyState
            title="Sin tarjetas virtuales"
            description="Crea una tarjeta virtual para comprar online con más seguridad"
            action={
              <Button variant="secondary" onClick={() => setCreateOpen(true)}>
                Crear tarjeta virtual
              </Button>
            }
          />
        ) : (
          <EmptyState title="Sin tarjetas" description="Todavía no tienes ninguna tarjeta física" />
        )
      ) : (
        <CardsGrid cards={visibleCards} onSelect={handleSelect} onEditLimits={handleEditLimits} />
      )}

      <CreateVirtualCardModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <CardLimitsModal card={limitsCard} onClose={handleCloseLimits} />
      <CardDetailsDrawer card={selectedCard} onClose={handleCloseDetails} onEditLimits={handleEditLimitsFromDrawer} />
    </motion.div>
  )
}
