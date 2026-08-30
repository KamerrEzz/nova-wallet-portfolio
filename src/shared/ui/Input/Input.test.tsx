import { render, screen } from '@testing-library/react'
import { Input } from './Input'

describe('Input', () => {
  it('associates the label with the input', () => {
    render(<Input label="Correo electrónico" />)
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
  })

  it('shows the error message with role alert and marks the input invalid', () => {
    render(<Input label="Correo" error="El correo no es válido" />)
    const input = screen.getByLabelText('Correo')
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('El correo no es válido')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', alert.id)
  })

  it('forwards ref and native props', () => {
    const ref = { current: null as HTMLInputElement | null }
    render(<Input ref={ref} placeholder="Tu nombre" />)
    expect(ref.current).toBe(screen.getByPlaceholderText('Tu nombre'))
  })
})
