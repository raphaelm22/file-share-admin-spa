import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ShareTable from './ShareTable'
import type { ShareWithStatus } from '../../../types'

const mockShares: ShareWithStatus[] = [
  {
    id: 'share-1',
    fileName: 'document.pdf',
    fileSize: 1024,
    expiresAt: null,
    createdAt: '2026-02-25T10:00:00Z',
    status: 'active',
  },
  {
    id: 'share-2',
    fileName: 'image.png',
    fileSize: 2048,
    expiresAt: '2026-02-25T08:00:00Z',
    createdAt: '2026-02-25T06:00:00Z',
    status: 'expired',
  },
]

describe('ShareTable', () => {
  it('exibe placeholder de loading', () => {
    // Arrange
    render(<ShareTable shares={[]} loading={true} error={null} />)

    // Assert
    expect(screen.getByText(/FETCHING_ACTIVE_SHARES/)).toBeInTheDocument()
  })

  it('exibe erro quando fetch falha', () => {
    // Arrange
    render(<ShareTable shares={[]} loading={false} error="HTTP 500" />)

    // Assert
    expect(screen.getByText(/SHARES_FETCH_FAILED/)).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('HTTP 500')).toBeInTheDocument()
  })

  it('exibe estado vazio quando não há compartilhamentos', () => {
    // Arrange
    render(<ShareTable shares={[]} loading={false} error={null} />)

    // Assert
    expect(screen.getByText(/NO_ACTIVE_SHARES_DETECTED/)).toBeInTheDocument()
  })

  it('renderiza linhas com fileName, TTL e status badge', () => {
    // Arrange
    render(<ShareTable shares={mockShares} loading={false} error={null} />)

    // Assert
    expect(screen.getByText('document.pdf')).toBeInTheDocument()
    expect(screen.getByText('∞')).toBeInTheDocument()
    expect(screen.getByText('image.png')).toBeInTheDocument()
  })

  it('badge ACTIVE tem texto "ACTIVE"', () => {
    // Arrange
    const activeShare: ShareWithStatus[] = [mockShares[0]]
    render(<ShareTable shares={activeShare} loading={false} error={null} />)

    // Assert
    expect(screen.getByText('ACTIVE')).toBeInTheDocument()
  })

  it('badge EXPIRED tem texto "EXPIRED"', () => {
    // Arrange
    const expiredShare: ShareWithStatus[] = [mockShares[1]]
    render(<ShareTable shares={expiredShare} loading={false} error={null} />)

    // Assert — badge é <span>, TTL cell é <td>; selector='span' garante o badge
    expect(screen.getByText('EXPIRED', { selector: 'span' })).toBeInTheDocument()
  })

  it('badge FILE_REMOVED tem texto "FILE_REMOVED"', () => {
    // Arrange
    const removedShare: ShareWithStatus[] = [{
      id: 'share-3',
      fileName: 'deleted.zip',
      fileSize: 512,
      expiresAt: null,
      createdAt: '2026-02-25T07:00:00Z',
      status: 'file-removed',
    }]
    render(<ShareTable shares={removedShare} loading={false} error={null} />)

    // Assert
    expect(screen.getByText('FILE_REMOVED')).toBeInTheDocument()
  })

  it('não mostra o botão de revogar sem onRevoke', () => {
    render(<ShareTable shares={mockShares} loading={false} error={null} />)

    expect(screen.queryByRole('button', { name: /Revogar/ })).not.toBeInTheDocument()
  })

  it('revoga só depois da confirmação (dois cliques)', async () => {
    // Arrange
    const onRevoke = vi.fn().mockResolvedValue(undefined)
    render(<ShareTable shares={mockShares} loading={false} error={null} onRevoke={onRevoke} />)

    // Act: primeiro clique só arma
    fireEvent.click(screen.getByRole('button', { name: 'Revogar link de document.pdf' }))

    // Assert
    expect(onRevoke).not.toHaveBeenCalled()
    const confirm = screen.getByRole('button', { name: 'Confirmar revogação de document.pdf' })
    expect(confirm).toHaveTextContent('CONFIRM?')

    // Act: segundo clique revoga
    fireEvent.click(confirm)

    // Assert
    await waitFor(() => expect(onRevoke).toHaveBeenCalledWith('share-1'))
  })

  it('mostra FAILED quando a revogação falha', async () => {
    // Arrange
    const onRevoke = vi.fn().mockRejectedValue(new Error('HTTP 500'))
    render(<ShareTable shares={mockShares} loading={false} error={null} onRevoke={onRevoke} />)

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Revogar link de image.png' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar revogação de image.png' }))

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent('FAILED')
  })
})
