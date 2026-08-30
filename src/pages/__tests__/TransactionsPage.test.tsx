/**
 * @jest-environment ../../../test/JsdomFetchEnvironment.cjs
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import { setupStore } from '@/app/store'
import { setCredentials } from '@/features/auth/authSlice'
import { getTransactionsFor } from '@/mocks/db'
import { signAccessToken } from '@/mocks/jwt'
import { server } from '@/mocks/server'
import { ThemeProvider } from '@/shared/theme/ThemeContext'

import TransactionsPage from '../TransactionsPage'

const DEMO_USER = { id: 'u-001', name: 'Alex Nova', email: 'demo@nova.app' }

function renderTransactions() {
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
        <MemoryRouter initialEntries={['/app/transactions']}>
          <TransactionsPage />
        </MemoryRouter>
      </ThemeProvider>
    </Provider>,
  )
}

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('TransactionsPage', () => {
  // MSW aplica latencia (150–400ms por petición); damos margen a findBy*.
  const WAIT = { timeout: 5000 }

  it('muestra skeletons y luego los movimientos de la API mock con el total', async () => {
    const { container } = renderTransactions()

    // Cabecera y skeletons mientras la petición está en vuelo.
    expect(screen.getByRole('heading', { name: 'Movimientos' })).toBeInTheDocument()
    expect(container.querySelector('.skeleton')).toBeInTheDocument()

    // Total real del mock db para el usuario demo.
    const firstPage = getTransactionsFor(DEMO_USER.id, { page: 1, pageSize: 10 })
    expect(
      await screen.findByText(`${firstPage.total} movimientos`, undefined, WAIT),
    ).toBeInTheDocument()

    // Títulos de la primera página (pueden repetirse entre filas).
    for (const tx of firstPage.items) {
      expect((await screen.findAllByText(tx.title, undefined, WAIT)).length).toBeGreaterThan(0)
    }
  })

  it('debouncea la búsqueda, envía el parámetro search y actualiza la lista', async () => {
    const searches: string[] = []
    server.use(
      http.get('/api/transactions', ({ request }) => {
        const url = new URL(request.url)
        const search = url.searchParams.get('search')
        if (search) searches.push(search)
        return HttpResponse.json(
          getTransactionsFor(DEMO_USER.id, {
            search: search ?? undefined,
            page: Number(url.searchParams.get('page')) || 1,
            pageSize: Number(url.searchParams.get('pageSize')) || 10,
          }),
        )
      }),
    )

    const user = userEvent.setup()
    renderTransactions()

    // Esperamos a que la carga inicial termine antes de teclear.
    const initial = getTransactionsFor(DEMO_USER.id, { page: 1, pageSize: 10 })
    expect(
      await screen.findByText(`${initial.total} movimientos`, undefined, WAIT),
    ).toBeInTheDocument()

    const input = screen.getByPlaceholderText('Buscar por título o categoría…')
    await user.type(input, 'Nómina')

    // La petición filtrada sale con el término completo (tras el debounce de 350ms).
    await waitFor(() => expect(searches).toContain('Nómina'), WAIT)

    // Solo quedan las 3 nóminas sembradas del usuario demo.
    const filtered = getTransactionsFor(DEMO_USER.id, { search: 'Nómina', page: 1, pageSize: 10 })
    expect(filtered.total).toBe(3)
    expect(await screen.findByText('3 movimientos', undefined, WAIT)).toBeInTheDocument()
    expect((await screen.findAllByText('Nómina NOVA Labs', undefined, WAIT)).length).toBe(3)
  })

  it('pagina con Siguiente y muestra los movimientos de la página 2', async () => {
    const user = userEvent.setup()
    renderTransactions()

    const firstPage = getTransactionsFor(DEMO_USER.id, { page: 1, pageSize: 10 })
    expect(
      await screen.findByText(`${firstPage.total} movimientos`, undefined, WAIT),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Siguiente' }))

    // La página 2 queda marcada como actual…
    await waitFor(
      () => expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page'),
      WAIT,
    )

    // …y llegan los movimientos de la segunda página.
    const secondPage = getTransactionsFor(DEMO_USER.id, { page: 2, pageSize: 10 })
    for (const tx of secondPage.items) {
      expect((await screen.findAllByText(tx.title, undefined, WAIT)).length).toBeGreaterThan(0)
    }
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeEnabled()
  })
})
