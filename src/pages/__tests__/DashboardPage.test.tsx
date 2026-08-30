/**
 * @jest-environment ../../../test/JsdomFetchEnvironment.cjs
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import { setupStore } from '@/app/store'
import { setCredentials } from '@/features/auth/authSlice'
import { getBalanceFor, getTransactionsFor } from '@/mocks/db'
import { signAccessToken } from '@/mocks/jwt'
import { server } from '@/mocks/server'
import { formatCurrency } from '@/shared/lib/format'
import { ThemeProvider } from '@/shared/theme/ThemeContext'

import DashboardPage from '../DashboardPage'

const DEMO_USER = { id: 'u-001', name: 'Alex Nova', email: 'demo@nova.app' }

/**
 * Intl currency output uses a non-breaking space before '€', but
 * Testing Library normalizes NBSP away in node text only (not in the
 * matcher), so exact string matching needs the NBSP collapsed here too.
 */
const collapseNbsp = (text: string) => text.replace(/ /g, ' ')

function renderDashboard() {
  const store = setupStore()
  store.dispatch(
    setCredentials({
      user: DEMO_USER,
      accessToken: signAccessToken({
        sub: DEMO_USER.id,
        name: DEMO_USER.name,
        email: DEMO_USER.email,
      }),
    }),
  )

  return render(
    <Provider store={store}>
      <ThemeProvider>
        <MemoryRouter initialEntries={['/app']}>
          <DashboardPage />
        </MemoryRouter>
      </ThemeProvider>
    </Provider>,
  )
}

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('DashboardPage', () => {
  // MSW aplica latencia (150–400ms por petición); damos margen a findBy*.
  const WAIT = { timeout: 5000 }

  it('muestra skeletons y luego el balance y los movimientos recientes', async () => {
    const { container } = renderDashboard()

    // Mientras las peticiones están en vuelo se muestran skeletons.
    expect(container.querySelector('.skeleton')).toBeInTheDocument()

    // Saludo con el nombre del usuario autenticado.
    expect(screen.getByText('Hola, Alex')).toBeInTheDocument()

    // Balance (dato real del mock db para el usuario demo).
    const balance = getBalanceFor(DEMO_USER.id)
    const expectedBalance = collapseNbsp(formatCurrency(balance.total, balance.currency))
    expect(await screen.findByText(expectedBalance, undefined, WAIT)).toBeInTheDocument()
    expect(screen.getByText('Balance total')).toBeInTheDocument()

    // Títulos de las 5 transacciones más recientes (pueden repetirse).
    const recent = getTransactionsFor(DEMO_USER.id, { page: 1, pageSize: 5 })
    for (const tx of recent.items) {
      expect((await screen.findAllByText(tx.title, undefined, WAIT)).length).toBeGreaterThan(0)
    }
  })

  it('muestra el estado de error con Reintentar cuando /api/balance falla y recupera al reintentar', async () => {
    server.use(
      http.get('/api/balance', () =>
        HttpResponse.json({ message: 'Error interno del servidor' }, { status: 500 }),
      ),
    )

    renderDashboard()

    // Estado de error de la tarjeta de balance (el resto de secciones cargan bien).
    expect(await screen.findByRole('alert', undefined, WAIT)).toBeInTheDocument()
    const retry = await screen.findByRole('button', { name: 'Reintentar' }, WAIT)

    // Restauramos el handler OK y reintentamos: el balance vuelve a cargar.
    server.resetHandlers()
    await userEvent.click(retry)

    const balance = getBalanceFor(DEMO_USER.id)
    const expectedBalance = collapseNbsp(formatCurrency(balance.total, balance.currency))
    expect(await screen.findByText(expectedBalance, undefined, WAIT)).toBeInTheDocument()
  })
})
