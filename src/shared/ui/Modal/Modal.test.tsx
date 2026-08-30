import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

describe('Modal', () => {
  it('renders content in a portal when open', () => {
    render(
      <Modal open onClose={jest.fn()} title="Detalles">
        Contenido del modal
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Contenido del modal')).toBeInTheDocument()
  })

  it('renders nothing when closed', () => {
    render(
      <Modal open={false} onClose={jest.fn()}>
        Contenido
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onClose when Escape is pressed', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    render(
      <Modal open onClose={onClose} title="Detalles">
        Contenido
      </Modal>,
    )
    await user.keyboard('{Escape}')
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
  })

  it('focuses the dialog on open', async () => {
    render(
      <Modal open onClose={jest.fn()} title="Detalles">
        Contenido
      </Modal>,
    )
    await waitFor(() => expect(screen.getByRole('dialog')).toHaveFocus())
  })
})
