import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { useAppSelector } from '@/app/hooks'
import { selectCurrentUser } from '@/features/auth/authSlice'
import ToastViewport from '@/features/ui/ToastViewport'
import { useLogoutMutation } from '@/shared/api/apiSlice'
import { cn } from '@/shared/lib/cn'

import styles from './AppLayout.module.css'

/* ------------------------------------------------------------------ */
/* Inline icons                                                       */
/* ------------------------------------------------------------------ */

interface IconProps {
  size?: number
}

function HomeIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  )
}

function ListIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
    </svg>
  )
}

function ExchangeIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h13l-3.5-3.5" />
      <path d="M20 17H7l3.5 3.5" />
    </svg>
  )
}

function CardIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </svg>
  )
}

function PiggyBankIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-8 .5-8 5 0 1.5.5 2.5 1 3.5l-1 1.5h2l.5-1.5c1.5.5 3 .5 4.5-.5 1.5.5 2.5 1.5 2.5 3h2v-2.5c0-1.5-1-2.5-2-3 1-.5 2-1.5 2-3 0-2-1.5-4-3.5-4z" />
      <path d="M2 9v2c0 1 .5 1.5 1.5 1.5" />
      <circle cx="16" cy="9" r="0.5" fill="currentColor" />
      <path d="M7 21v-2M17 21v-2" />
    </svg>
  )
}

function ChartIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3v18h18" />
      <path d="M7 15l4-6 4 4 5-8" />
      <circle cx="7" cy="15" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="11" cy="9" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="20" cy="5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function BellIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  )
}

function HelpCircleIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  )
}

function UserIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
    </svg>
  )
}

function LogoutIcon({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

const NAV_ITEMS = [
  { to: '/app', label: 'Panel', end: true, Icon: HomeIcon },
  { to: '/app/transactions', label: 'Movimientos', end: false, Icon: ListIcon },
  { to: '/app/transfers', label: 'Transferir', end: false, Icon: ExchangeIcon },
  { to: '/app/cards', label: 'Tarjetas', end: false, Icon: CardIcon },
  { to: '/app/savings', label: 'Ahorros', end: false, Icon: PiggyBankIcon },
  { to: '/app/investments', label: 'Inversiones', end: false, Icon: ChartIcon },
  { to: '/app/notifications', label: 'Notificaciones', end: false, Icon: BellIcon },
  { to: '/app/help', label: 'Ayuda', end: false, Icon: HelpCircleIcon },
  { to: '/app/profile', label: 'Perfil', end: false, Icon: UserIcon },
]

function Logo() {
  return (
    <NavLink to="/app" className={styles.logo}>
      NOVA<span className={styles.logoAccent}>.</span>
    </NavLink>
  )
}

export default function AppLayout() {
  const user = useAppSelector(selectCurrentUser)
  const [logout] = useLogoutMutation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout().unwrap()
    } catch {
      // La sesión local ya se limpió desde onQueryStarted.
    }
    navigate('/')
  }

  const initial = user?.name?.trim().charAt(0).toUpperCase() ?? 'N'

  return (
    <div className={styles.shell}>
      {/* Desktop sidebar */}
      <aside className={styles.sidebar}>
        <Logo />

        <nav className={styles.nav} aria-label="Navegación principal">
          {NAV_ITEMS.map(({ to, label, end, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(styles.navLink, isActive && styles.navLinkActive)
              }
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.userCard}>
          <span className={styles.avatar} aria-hidden="true">
            {initial}
          </span>
          <div className={styles.userMeta}>
            <p className={styles.userName}>{user?.name ?? 'Usuario'}</p>
            <p className={styles.userEmail}>{user?.email ?? ''}</p>
          </div>
          <button
            type="button"
            className={styles.logoutButton}
            onClick={() => {
              void handleLogout()
            }}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogoutIcon />
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className={styles.topbar}>
        <Logo />
      </header>

      {/* Content */}
      <main className={styles.main}>
        <div className={styles.container}>
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className={styles.bottomnav} aria-label="Navegación principal">
        {NAV_ITEMS.map(({ to, label, end, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(styles.bottomLink, isActive && styles.bottomLinkActive)
            }
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <ToastViewport />
    </div>
  )
}
