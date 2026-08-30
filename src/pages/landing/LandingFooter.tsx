import { Link } from 'react-router-dom'
import styles from './LandingFooter.module.css'

const FOOTER_LINKS = [
  { href: '#producto', label: 'Producto' },
  { href: '#tarjeta', label: 'Tarjeta' },
  { href: '#opiniones', label: 'Opiniones' },
] as const

/** Minimal footer: wordmark, anchor links and the demo copyright line. */
export function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <Link to="/" className={styles.wordmark}>
            <span className={styles.mark} aria-hidden="true" />
            NOVA
          </Link>
          <ul className={styles.links}>
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <a className={styles.link} href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link className={styles.link} to="/login">
                Entrar
              </Link>
            </li>
          </ul>
        </div>
        <p className={styles.copy}>© 2026 NOVA Wallet — Proyecto demo</p>
      </div>
    </footer>
  )
}
