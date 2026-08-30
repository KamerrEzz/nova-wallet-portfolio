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
import { addTransaction } from '@/mocks/db'
import { signAccessToken } from '@/mocks/jwt'
import { server } from '@/mocks/server'
import { ThemeProvider } from '@/shared/theme/ThemeContext'

import TransfersPage from '../TransfersPage'

const DEMO_USER = { id: 'u-001', name: 'Alex Nova', email: 'demo@nova.app' }

function renderTransfers() {
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
        <MemoryRouter initialEntries={['/app/transfers']}>
          <TransfersPage />
        </MemoryRouter>
      </ThemeProvider>
    </Provider>,
  )
}

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('TransfersPage', () => {
  // MSW aplica latencia y la mutación de transferencia tarda ~800ms.
  const WAIT = { timeout: 5000 }

  it('carga los destinatarios, permite filtrar y exige seleccionar uno para continuar', async () => {
    renderTransfers()

    // Sin selección no se puede continuar.
    const continuar = screen.getByRole('button', { name: 'Continuar' })
    expect(continuar).toBeDisabled()

    // Los destinatarios cargan (el usuario demo no se lista a sí mismo).
    await screen.findByRole('button', { name: /María Torres/ }, WAIT)
    expect(screen.getByRole('button', { name: /Diego Ramos/ })).toBeInTheDocument()

    // El buscador filtra la lista en cliente.
    const search = screen.getByLabelText('Buscar destinatario')
    await userEvent.type(search, 'diego')
    expect(screen.queryByRole('button', { name: /María Torres/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Diego Ramos/ })).toBeInTheDocument()
    await userEvent.clear(search)

    // Al seleccionar un destinatario se habilita Continuar.
    await userEvent.click(await screen.findByRole('button', { name: /María Torres/ }, WAIT))
    expect(continuar).toBeEnabled()
  })

  it('completa una transferencia y muestra la pantalla de éxito', async () => {
    // Ingresamos saldo extra para que la transferencia pase con margen la
    // validación de saldo del handler real, sea cual sea el balance semilla.
    addTransaction(DEMO_USER.id, {
      title: 'Ingreso puntual',
      category: 'ingresos',
      amount: 10000,
    })

    renderTransfers()

    // Paso 1 — destinatario.
    await userEvent.click(await screen.findByRole('button', { name: /María Torres/ }, WAIT))
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }))

    // Paso 2 — importe.
    const amount = await screen.findByLabelText('Importe', undefined, WAIT)
    await userEvent.type(amount, '10')
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }))

    // Paso 3 — confirmación (el endpoint tarda ~800ms).
    await userEvent.click(
      await screen.findByRole('button', { name: 'Confirmar transferencia' }, WAIT),
    )

    expect(
      await screen.findByRole('heading', { name: 'Transferencia enviada' }, WAIT),
    ).toBeInTheDocument()
  }, 15000)

  it('muestra el error del servidor cuando el importe supera el saldo', async () => {
    // Inflamos el balance que ve el cliente para superar la validación local;
    // el handler de /api/transfers calcula el saldo real y responde 422.
    server.use(
      http.get('/api/balance', () =>
        HttpResponse.json({ total: 100000000, currency: 'EUR', monthlyChangePct: 0 }),
      ),
    )

    renderTransfers()

    await userEvent.click(await screen.findByRole('button', { name: /Diego Ramos/ }, WAIT))
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }))

    const amount = await screen.findByLabelText('Importe', undefined, WAIT)
    await userEvent.type(amount, '99999999')
    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }))

    await userEvent.click(
      await screen.findByRole('button', { name: 'Confirmar transferencia' }, WAIT),
    )

    // El mensaje del servidor aparece inline en el paso de confirmación.
    const alert = await screen.findByRole('alert', undefined, WAIT)
    expect(alert).toHaveTextContent('Saldo insuficiente')

    // Se ofrece volver al paso de importe.
    expect(screen.getByRole('button', { name: 'Volver al importe' })).toBeInTheDocument()
  })
})
