import { render, screen } from '@testing-library/react'
import ShareTable from './ShareTable'
import type { ShareWithStatus } from '../../../types'

const mockShares: ShareWithStatus[] = [
  {
    id: 'share-1',
    token: 'abc123',
    fileName: 'document.pdf',
    fileSize: 1024,
    expiresAt: null,
    createdAt: '2026-02-25T10:00:00Z',
    status: 'active',
  },
  {
    id: 'share-2',
    token: 'def456',
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
      token: 'ghi789',
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
})
