import { useState } from 'react'

import { useGetGoalsQuery } from '@/shared/api/apiSlice'
import { formatCurrency } from '@/shared/lib/format'
import type { Goal, Vault } from '@/shared/types'
import { Badge, Button, Card, EmptyState, ErrorState, Progress, Skeleton } from '@/shared/ui'

import { CreateGoalModal } from './CreateGoalModal'
import styles from './GoalsSection.module.css'

const MS_PER_DAY = 86_400_000

/** Whole days remaining until the target date (negative when overdue). */
function daysUntil(targetDate: string): number {
  const now = new Date()
  const target = new Date(targetDate)
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate())
  return Math.round((startOfTarget.getTime() - startOfNow.getTime()) / MS_PER_DAY)
}

function countdownLabel(days: number): string {
  if (days > 1) return `Faltan ${days} días`
  if (days === 1) return 'Falta 1 día'
  if (days === 0) return 'Vence hoy'
  return 'Fecha vencida'
}

const AUTO_RULE_LABELS: Record<NonNullable<Goal['autoRule']>, string> = {
  roundup: 'Redondeo',
  percentage: 'Porcentaje',
  fixed: 'Aporte fijo',
}

export interface GoalsSectionProps {
  vaults: Vault[]
}

export function GoalsSection({ vaults }: GoalsSectionProps) {
  const { data: goals, isLoading, isError, refetch } = useGetGoalsQuery()
  const [createOpen, setCreateOpen] = useState(false)

  const vaultById = new Map(vaults.map((vault) => [vault.id, vault]))

  let content
  if (isLoading) {
    content = (
      <div className={styles.list} aria-busy="true" aria-label="Cargando metas">
        {Array.from({ length: 2 }, (_, index) => (
          <Skeleton key={index} width="100%" height={120} borderRadius={16} />
        ))}
      </div>
    )
  } else if (isError) {
    content = <ErrorState title="No hemos podido cargar tus metas" onRetry={refetch} />
  } else if (!goals || goals.length === 0) {
    content = (
      <EmptyState
        title="Sin metas todavía"
        description="Define una meta con fecha límite y te ayudamos a llegar a tiempo."
        action={
          <Button variant="secondary" onClick={() => setCreateOpen(true)}>
            Crear meta
          </Button>
        }
      />
    )
  } else {
    content = (
      <ul className={styles.list} aria-label="Tus metas de ahorro">
        {goals.map((goal) => {
          const vault = vaultById.get(goal.vaultId)
          const current = vault?.currentAmount ?? 0
          const days = daysUntil(goal.targetDate)
          return (
            <li key={goal.id}>
              <Card padding="md" className={styles.goalCard}>
                <div className={styles.goalHeader}>
                  <div className={styles.goalHeading}>
                    <h3 className={styles.goalName}>{goal.name}</h3>
                    {vault && <span className={styles.goalVault}>en {vault.name}</span>}
                  </div>
                  <Badge variant={days < 0 ? 'danger' : days <= 30 ? 'accent' : 'neutral'} dot>
                    {countdownLabel(days)}
                  </Badge>
                </div>
                <Progress
                  value={current}
                  max={goal.targetAmount}
                  label={`${formatCurrency(current)} de ${formatCurrency(goal.targetAmount)}`}
                  showValue
                />
                {goal.autoRule && (
                  <p className={styles.goalRule}>
                    Regla automática: {AUTO_RULE_LABELS[goal.autoRule]}
                    {goal.autoValue !== undefined &&
                      (goal.autoRule === 'percentage'
                        ? ` · ${goal.autoValue}% de cada ingreso`
                        : ` · ${formatCurrency(goal.autoValue)}`)}
                  </p>
                )}
              </Card>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <section aria-labelledby="goals-heading" className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 id="goals-heading" className={styles.heading}>
          Metas
        </h2>
        <Button size="sm" variant="secondary" onClick={() => setCreateOpen(true)}>
          Nueva meta
        </Button>
      </div>
      {content}
      <CreateGoalModal open={createOpen} onClose={() => setCreateOpen(false)} vaults={vaults} />
    </section>
  )
}
