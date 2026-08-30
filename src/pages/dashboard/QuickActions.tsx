import { Link } from 'react-router-dom'

import { Card } from '@/shared/ui'

import styles from './QuickActions.module.css'

/* ------------------------------------------------------------------ */
/* Action icons (small inline SVGs)                                    */
/* ------------------------------------------------------------------ */

function baseIcon(paths: string) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths} />
    </svg>
  )
}

const TransferIcon = () => baseIcon('M4 7h13l-3.5-3.5M20 17H7l3.5 3.5')
const VaultIcon = () => baseIcon('M12 5v14M5 12h14')
const VirtualCardIcon = () => baseIcon('M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5ZM3 10h18M7 15h4')

/* ------------------------------------------------------------------ */
/* Quick actions                                                       */
/* ------------------------------------------------------------------ */

const ACTIONS = [
  {
    to: '/app/transfers',
    label: 'Transferir',
    description: 'Envía dinero al instante',
    Icon: TransferIcon,
  },
  {
    to: '/app/savings',
    label: 'Añadir a bóveda',
    description: 'Aparta dinero para tus metas',
    Icon: VaultIcon,
  },
  {
    to: '/app/cards',
    label: 'Crear tarjeta virtual',
    description: 'Paga online con seguridad',
    Icon: VirtualCardIcon,
  },
] as const

export function QuickActions() {
  return (
    <Card padding="lg" aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className={styles.heading}>
        Acciones rápidas
      </h2>
      <ul className={styles.actions}>
        {ACTIONS.map(({ to, label, description, Icon }) => (
          <li key={to}>
            <Link to={to} className={styles.action}>
              <span className={styles.icon}>
                <Icon />
              </span>
              <span className={styles.info}>
                <span className={styles.label}>{label}</span>
                <span className={styles.description}>{description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}
