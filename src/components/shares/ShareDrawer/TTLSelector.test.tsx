import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TTLSelector from './TTLSelector'

describe('TTLSelector', () => {
  it('renderiza 4 opções de TTL', () => {
    // Arrange
    render(<TTLSelector value={24} onChange={() => undefined} />)

    // Assert
    expect(screen.getByRole('radio', { name: '1H' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '24H' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: '7D' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'INF' })).toBeInTheDocument()
  })

  it('opção 24H começa com aria-checked="true" quando value=24', () => {
    // Arrange
    render(<TTLSelector value={24} onChange={() => undefined} />)

    // Assert
    expect(screen.getByRole('radio', { name: '24H' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: '1H' })).toHaveAttribute('aria-checked', 'false')
  })

  it('onChange é chamado com valor correto ao clicar', async () => {
    // Arrange
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<TTLSelector value={24} onChange={onChange} />)

    // Act
    await user.click(screen.getByRole('radio', { name: '7D' }))

    // Assert
    expect(onChange).toHaveBeenCalledWith(168)
  })

  it('hint exibe segundos corretos para TTL selecionado', () => {
    // Arrange
    render(<TTLSelector value={1} onChange={() => undefined} />)

    // Assert
    expect(screen.getByText(/LINK_DECAY: 3600 SECONDS/)).toBeInTheDocument()
  })

  it('não exibe hint quando INF selecionado', () => {
    // Arrange
    render(<TTLSelector value={null} onChange={() => undefined} />)

    // Assert
    expect(screen.queryByText(/LINK_DECAY/)).not.toBeInTheDocument()
  })
})
