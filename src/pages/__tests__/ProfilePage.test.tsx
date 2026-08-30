/**
 * @jest-environment ../../../test/JsdomFetchEnvironment.cjs
 */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import { setupStore } from '@/app/store'
import { setCredentials } from '@/features/auth/authSlice'
import { signAccessToken } from '@/mocks/jwt'
import { server } from '@/mocks/server'
import { ThemeProvider } from '@/shared/theme/ThemeContext'

import ProfilePage from '../ProfilePage'

const DEMO_USER = { id: 'u-001', name: 'Alex Nova', email: 'demo@nova.app' }

function renderProfile() {
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
        <MemoryRouter initialEntries={['/app/profile']}>
          <ProfilePage />
        </MemoryRouter>
      </ThemeProvider>
    </Provider>,
  )
}

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

beforeEach(() => {
  window.localStorage.clear()
})

describe('ProfilePage', () => {
  // MSW aplica latencia (150–400ms por petición); damos margen a findBy*.
  const WAIT = { timeout: 5000 }

  it('carga el perfil y muestra el nombre y el email del usuario', async () => {
    renderProfile()

    expect(await screen.findByRole('heading', { name: DEMO_USER.name }, WAIT)).toBeInTheDocument()
    expect(screen.getByText(DEMO_USER.email)).toBeInTheDocument()
    expect(screen.getByText('Cuenta verificada')).toBeInTheDocument()
  })

  it('edita el nombre, envía el PATCH y muestra el feedback de éxito', async () => {
    renderProfile()

    const nameInput = await screen.findByLabelText('Nombre', undefined, WAIT)
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Ada Lovelace')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    // Feedback inline de éxito.
    expect(await screen.findByText('Perfil actualizado', undefined, WAIT)).toBeInTheDocument()

    // El PATCH se aplicó: la invalidación recarga /me y la tarjeta muestra el nuevo nombre.
    expect(
      await screen.findByRole('heading', { name: 'Ada Lovelace' }, WAIT),
    ).toBeInTheDocument()
  })

  it('muestra el error de validación de zod al enviar el nombre vacío', async () => {
    renderProfile()

    const nameInput = await screen.findByLabelText('Nombre', undefined, WAIT)
    await userEvent.clear(nameInput)
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(
      await screen.findByText('El nombre debe tener al menos 2 caracteres', undefined, WAIT),
    ).toBeInTheDocument()
  })

  it('el control segmentado de tema cambia data-theme del documento a light', async () => {
    renderProfile()

    await userEvent.click(screen.getByRole('button', { name: 'Claro' }))

    await waitFor(
      () => expect(document.documentElement).toHaveAttribute('data-theme', 'light'),
      WAIT,
    )
  })
})
