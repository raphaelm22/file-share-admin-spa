import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import ShareDrawer from './ShareDrawer'
import * as api from '../../../api'
import type { FileEntry, Share } from '../../../types'

vi.mock('focus-trap-react', () => ({
  FocusTrap: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const mockFile: FileEntry = {
  filePath: '/app/shared-files/file.pdf',
  fileName: 'file.pdf',
  fileSize: 1024,
  modifiedAt: '2026-02-24T10:00:00Z',
  directory: '',
}

const mockShare: Share = {
  id: 'abc123',
  token: 'deadbeef'.repeat(8),
  fileName: 'file.pdf',
  fileSize: 1024,
  expiresAt: '2026-02-25T10:00:00Z',
  createdAt: '2026-02-24T10:00:00Z',
}

describe('ShareDrawer', () => {
  beforeEach(() => {
    vi.spyOn(api, 'createShare').mockResolvedValue(mockShare)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('chama createShare com filePath e ttlHours=24 ao montar', async () => {
    // Arrange & Act
    render(<ShareDrawer file={mockFile} onClose={vi.fn()} />)

    // Assert
    await waitFor(() => expect(api.createShare).toHaveBeenCalledWith('/app/shared-files/file.pdf', 24))
  })

  it('exibe nome do arquivo no TargetFileCard', () => {
    // Arrange & Act
    render(<ShareDrawer file={mockFile} onClose={vi.fn()} />)

    // Assert
    expect(screen.getByText('file.pdf')).toBeInTheDocument()
  })

  it('exibe erro inline quando createShare rejeita (arquivo não encontrado)', async () => {
    // Arrange
    vi.spyOn(api, 'createShare').mockRejectedValue(new Error('FILE_NOT_FOUND'))
    render(<ShareDrawer file={mockFile} onClose={vi.fn()} />)

    // Assert
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.getByText(/SHARE_FAILED/)).toBeInTheDocument()
  })

  it('chama onClose ao clicar no botão fechar', async () => {
    // Arrange
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<ShareDrawer file={mockFile} onClose={onClose} />)

    // Act
    await user.click(screen.getByRole('button', { name: /fechar/i }))

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('chama onClose ao pressionar Esc', async () => {
    // Arrange
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<ShareDrawer file={mockFile} onClose={onClose} />)

    // Act
    await user.keyboard('{Escape}')

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('copia link e exibe estado COPIED por 2 segundos', async () => {
    // Arrange — render with real timers, wait for share generation
    render(<ShareDrawer file={mockFile} onClose={vi.fn()} />)
    await waitFor(() => expect(api.createShare).toHaveBeenCalledTimes(1))

    // Switch to fake timers now that initial setup is done
    vi.useFakeTimers()

    // Act — fireEvent avoids userEvent internal timer usage
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /copy_to_clipboard/i }))
      await Promise.resolve() // flush clipboard.writeText promise
      await Promise.resolve() // flush setCopied(true) state update
    })

    // Assert — COPIED state
    expect(screen.getByText(/LINK_READY/)).toBeInTheDocument()

    // Advance past the 2s revert timeout
    act(() => {
      vi.advanceTimersByTime(2100)
    })

    // Assert — reverted
    expect(screen.getByRole('button', { name: /copy_to_clipboard/i })).toBeInTheDocument()
  })

  it('recria share ao mudar TTL', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<ShareDrawer file={mockFile} onClose={vi.fn()} />)
    await waitFor(() => expect(api.createShare).toHaveBeenCalledTimes(1))

    // Act
    await user.click(screen.getByRole('radio', { name: '7D' }))

    // Assert
    await waitFor(() =>
      expect(api.createShare).toHaveBeenCalledWith('/app/shared-files/file.pdf', 168),
    )
    expect(api.createShare).toHaveBeenCalledTimes(2)
  })
})
