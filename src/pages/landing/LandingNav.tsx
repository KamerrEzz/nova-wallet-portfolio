import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import { useClickOutside, useScrollProgress } from '@/shared/hooks'
import { Button, ThemeToggle } from '@/shared/ui'
import styles from './LandingNav.module.css'

const NAV_LINKS = [
  { href: '#producto', label: 'Producto' },
  { href: '#tarjeta', label: 'Tarjeta' },
  { href: '#opiniones', label: 'Opiniones' },
] as const

/** Fixed top nav: transparent over the hero, glass after 24px of scroll. */
export function LandingNav() {
  const { scrollY } = useScrollProgress()
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useClickOutside<HTMLElement>(() => setMenuOpen(false))

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header ref={headerRef} className={cn(styles.header, scrollY > 24 && styles.scrolled)}>
      <div className={styles.inner}>
        <Link to="/" className={styles.wordmark} onClick={closeMenu}>
          <span className={styles.mark} aria-hidden="true" />
          NOVA
        </Link>

        <nav className={styles.desktopNav} aria-label="Navegación principal">
          <ul className={styles.linkList}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a className={styles.navLink} href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <ThemeToggle />
          <div className={styles.desktopActions}>
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Crear cuenta</Button>
            </Link>
          </div>
          <button
            type="button"
            className={cn(styles.menuButton, menuOpen && styles.menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-menu"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        id="landing-mobile-menu"
        className={cn(styles.mobilePanel, menuOpen && styles.mobilePanelOpen)}
      >
        <nav aria-label="Navegación móvil">
          <ul className={styles.mobileList}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a className={styles.mobileLink} href={link.href} onClick={closeMenu}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.mobileActions}>
          <Link to="/login" onClick={closeMenu}>
            <Button variant="ghost" fullWidth>
              Entrar
            </Button>
          </Link>
          <Link to="/register" onClick={closeMenu}>
            <Button fullWidth>Crear cuenta</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
