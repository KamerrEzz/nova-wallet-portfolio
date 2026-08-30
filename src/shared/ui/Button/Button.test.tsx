import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Guardar</Button>)
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('is disabled while loading', () => {
    render(<Button loading>Guardar</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
  })

  it('fires onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Guardar</Button>)
    await user.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not fire onClick while loading', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    render(
      <Button loading onClick={onClick}>
        Guardar
      </Button>,
    )
    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })
})
