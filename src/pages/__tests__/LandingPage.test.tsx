import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@/shared/theme/ThemeContext'
import LandingPage from '../LandingPage'

function renderLanding() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('LandingPage', () => {
  it('renders the hero headline', () => {
    renderLanding()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /tu dinero, en físico y en digital/i,
    )
  })

  it('links every "Crear cuenta" to /register', () => {
    renderLanding()
    const links = screen.getAllByRole('link', { name: /crear cuenta/i })
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link).toHaveAttribute('href', '/register')
    }
  })

  it('links every "Entrar" to /login', () => {
    renderLanding()
    const links = screen.getAllByRole('link', { name: /^entrar$/i })
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link).toHaveAttribute('href', '/login')
    }
  })

  it('shows the demo copyright in the footer', () => {
    renderLanding()
    expect(screen.getByText(/© 2026 NOVA Wallet — Proyecto demo/)).toBeInTheDocument()
  })

  it('exposes the main landmarks', () => {
    renderLanding()
    expect(screen.getByRole('navigation', { name: /principal/i })).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
