/**
 * @jest-environment-options {"customExportConditions": ["node", "node-addons"]}
 */
import './testPolyfills'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { setupStore } from '@/app/store'
import { server } from '@/mocks/server'
import LoginPage from '@/pages/LoginPage'
import { ThemeProvider } from '@/shared/theme/ThemeContext'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function renderLoginPage() {
  const store = setupStore()
  return render(
    <Provider store={store}>
      <ThemeProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/app" element={<div>Panel principal</div>} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </Provider>,
  )
}

describe('LoginPage', () => {
  it('muestra errores de validación al enviar el formulario vacío', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Introduce un email válido')).toBeInTheDocument()
    expect(screen.getByText('Mínimo 6 caracteres')).toBeInTheDocument()
  })

  it('muestra el error del servidor cuando las credenciales son incorrectas', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText('Email'), 'nadie@nova.app')
    await user.type(screen.getByLabelText('Contraseña'), 'clave123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Credenciales incorrectas')
  })

  it('navega a /app tras un login correcto con las credenciales demo', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.click(screen.getByRole('button', { name: 'Rellenar demo' }))
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Panel principal')).toBeInTheDocument()
  })
})
