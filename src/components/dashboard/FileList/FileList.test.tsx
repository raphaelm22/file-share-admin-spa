import { render, screen } from '@testing-library/react'
import FileList from './FileList'
import type { FileEntry } from '../../../types'

const mockFiles: FileEntry[] = [
  { filePath: '/app/shared-files/video.mp4', fileName: 'video.mp4', fileSize: 52428800, modifiedAt: '2026-02-24T09:00:00Z', directory: '' },
  { filePath: '/app/shared-files/image.png', fileName: 'image.png', fileSize: 204800,   modifiedAt: '2026-02-24T08:00:00Z', directory: '' },
]

describe('FileList', () => {
  it('exibe mensagem de loading enquanto carregando', () => {
    // Arrange
    render(<FileList files={[]} loading={true} error={null} />)

    // Assert
    expect(screen.getByText(/ESTABLISHING_CONNECTION/)).toBeInTheDocument()
  })

  it('exibe empty state quando não há arquivos e não está carregando', () => {
    // Arrange
    render(<FileList files={[]} loading={false} error={null} />)

    // Assert
    expect(screen.getByText(/AWAITING_INPUT/)).toBeInTheDocument()
    expect(screen.getByText(/MONITORING: ACTIVE/)).toBeInTheDocument()
  })

  it('renderiza um FileRow por arquivo', () => {
    // Arrange
    render(<FileList files={mockFiles} loading={false} error={null} />)

    // Assert
    expect(screen.getByText('video.mp4')).toBeInTheDocument()
    expect(screen.getByText('image.png')).toBeInTheDocument()
  })

  it('exibe mensagem de erro quando há falha no fetch', () => {
    // Arrange
    render(<FileList files={[]} loading={false} error="HTTP 500" />)

    // Assert
    expect(screen.getByText(/FETCH_FAILED/)).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('não exibe loading quando há arquivos', () => {
    // Arrange
    render(<FileList files={mockFiles} loading={false} error={null} />)

    // Assert
    expect(screen.queryByText(/ESTABLISHING_CONNECTION/)).not.toBeInTheDocument()
  })

  it('lista de arquivos tem label acessível', () => {
    // Arrange
    render(<FileList files={mockFiles} loading={false} error={null} />)

    // Assert
    expect(screen.getByRole('list', { name: /Arquivos monitorados/i })).toBeInTheDocument()
  })

  it('exibe badge SHARED_ACTIVE no FileRow quando fileName está em activeShareFileNames', () => {
    // Arrange
    const activeShareFileNames = new Set(['video.mp4'])
    render(<FileList files={mockFiles} loading={false} error={null} activeShareFileNames={activeShareFileNames} />)

    // Assert
    expect(screen.getByText('SHARED_ACTIVE')).toBeInTheDocument()
  })

  it('exibe badge SHARED_ACTIVE apenas no arquivo compartilhado — não em outros', () => {
    // Arrange — só video.mp4 está compartilhado; image.png não está
    const activeShareFileNames = new Set(['video.mp4'])
    render(<FileList files={mockFiles} loading={false} error={null} activeShareFileNames={activeShareFileNames} />)

    // Assert — apenas um badge visível
    expect(screen.getAllByText('SHARED_ACTIVE')).toHaveLength(1)
  })
})
