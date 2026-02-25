import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FileRow from './FileRow'
import type { FileEntry } from '../../../types'

const mockFile: FileEntry = {
  filePath: '/app/shared-files/document.pdf',
  fileName: 'document.pdf',
  fileSize: 1536000, // ~1.5 MB
  modifiedAt: '2026-02-24T10:30:00Z',
  directory: '',
}

describe('FileRow', () => {
  it('renderiza tag [FILE], nome e tamanho formatado', () => {
    // Arrange
    render(<FileRow file={mockFile} />)

    // Assert
    expect(screen.getByText('[FILE]')).toBeInTheDocument()
    expect(screen.getByText('document.pdf')).toBeInTheDocument()
    expect(screen.getByText('1.5 MB')).toBeInTheDocument()
    expect(screen.getByText(/\d{2}\/\d{2}\/\d{4}/)).toBeInTheDocument()
  })

  it('inicia colapsado — FileActionsBar não visível', () => {
    // Arrange
    render(<FileRow file={mockFile} />)

    // Assert
    expect(screen.queryByText('[ SHARE ]')).not.toBeInTheDocument()
  })

  it('botão de linha começa com aria-expanded="false"', () => {
    // Arrange
    render(<FileRow file={mockFile} />)

    // Assert
    const rowButton = screen.getByRole('button')
    expect(rowButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('expande ao clicar — FileActionsBar fica visível', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<FileRow file={mockFile} />)
    const rowButton = screen.getByRole('button')

    // Act
    await user.click(rowButton)

    // Assert
    expect(screen.getByText('[ SHARE ]')).toBeInTheDocument()
    expect(rowButton).toHaveAttribute('aria-expanded', 'true')
  })

  it('colapsa ao clicar novamente — FileActionsBar desaparece', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<FileRow file={mockFile} />)
    const rowButton = screen.getByRole('button')

    // Act
    await user.click(rowButton) // expande
    await user.click(rowButton) // colapsa

    // Assert
    expect(screen.queryByText('[ SHARE ]')).not.toBeInTheDocument()
    expect(rowButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('formata arquivo pequeno em bytes', () => {
    // Arrange
    const smallFile: FileEntry = { ...mockFile, fileSize: 512 }
    render(<FileRow file={smallFile} />)

    // Assert
    expect(screen.getByText('512 B')).toBeInTheDocument()
  })

  it('formata arquivo grande em GB', () => {
    // Arrange
    const bigFile: FileEntry = { ...mockFile, fileSize: 2 * 1024 * 1024 * 1024 }
    render(<FileRow file={bigFile} />)

    // Assert
    expect(screen.getByText('2.00 GB')).toBeInTheDocument()
  })

  it('chama onShare com o arquivo ao clicar em [ SHARE ]', async () => {
    // Arrange
    const onShare = vi.fn()
    const user = userEvent.setup()
    render(<FileRow file={mockFile} onShare={onShare} />)

    // Act
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByText('[ SHARE ]'))

    // Assert
    expect(onShare).toHaveBeenCalledTimes(1)
    expect(onShare).toHaveBeenCalledWith(mockFile)
  })

  it('exibe badge SHARED_ACTIVE quando isShared=true', () => {
    // Arrange
    render(<FileRow file={mockFile} isShared={true} />)

    // Assert
    expect(screen.getByText('SHARED_ACTIVE')).toBeInTheDocument()
  })

  it('não exibe badge SHARED_ACTIVE quando isShared=false', () => {
    // Arrange
    render(<FileRow file={mockFile} isShared={false} />)

    // Assert
    expect(screen.queryByText('SHARED_ACTIVE')).not.toBeInTheDocument()
  })
})
