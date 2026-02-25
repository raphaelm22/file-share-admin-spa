import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'

// NÃO importar describe/it/expect — globals: true no vitest config

vi.mock('./api', () => ({
  fetchFiles: vi.fn().mockResolvedValue([
    { filePath: '/root/backups/file1.tar', fileName: 'file1.tar', fileSize: 1024, modifiedAt: '2026-01-01T00:00:00Z', directory: 'backups' },
    { filePath: '/root/configs/cfg.json', fileName: 'cfg.json', fileSize: 256, modifiedAt: '2026-01-01T00:00:00Z', directory: 'configs' },
    { filePath: '/root/readme.txt', fileName: 'readme.txt', fileSize: 128, modifiedAt: '2026-01-01T00:00:00Z', directory: '' },
  ]),
  fetchShares: vi.fn().mockResolvedValue([]),
  fetchSystemStats: vi.fn().mockResolvedValue({
    cpuPercent: 10, ramUsedMb: 256, ramTotalMb: 1024, diskUsedGb: 5, diskTotalGb: 32,
  }),
  fetchDirectoryTree: vi.fn().mockResolvedValue({
    name: 'uploads',
    path: '',
    children: [
      { name: 'backups', path: 'backups', children: [] },
      { name: 'configs', path: 'configs', children: [] },
    ],
  }),
}))

vi.mock('./hooks/useSignalR', () => ({
  useSignalR: vi.fn(),
}))

describe('App — DirectoryTree integration', () => {
  it('renders DirectoryTree after fetchDirectoryTree resolves', async () => {
    // Arrange
    render(<App />)

    // Assert
    await waitFor(() => expect(screen.getByText('uploads')).toBeInTheDocument())
    expect(screen.getByText('backups')).toBeInTheDocument()
    expect(screen.getByText('configs')).toBeInTheDocument()
  })

  it('exibe todos os arquivos quando nenhum diretório está selecionado', async () => {
    // Arrange
    render(<App />)

    // Assert
    await waitFor(() => expect(screen.getByText('readme.txt')).toBeInTheDocument())
    expect(screen.getByText('file1.tar')).toBeInTheDocument()
    expect(screen.getByText('cfg.json')).toBeInTheDocument()
  })

  it('filtra FileList ao selecionar um diretório na árvore', async () => {
    // Arrange
    render(<App />)
    await waitFor(() => expect(screen.getByText('backups')).toBeInTheDocument())

    // Act — clicar em "backups" na árvore seleciona o diretório
    const treeItems = screen.getAllByText('backups')
    fireEvent.click(treeItems[0])

    // Assert — apenas arquivos em "backups" são visíveis
    expect(screen.getByText('file1.tar')).toBeInTheDocument()
    expect(screen.queryByText('cfg.json')).not.toBeInTheDocument()
    expect(screen.queryByText('readme.txt')).not.toBeInTheDocument()
  })

  it('exibe todos os arquivos ao desselecionar (onSelect(null))', async () => {
    // Arrange
    render(<App />)
    await waitFor(() => expect(screen.getByText('backups')).toBeInTheDocument())
    const treeItems = screen.getAllByText('backups')
    fireEvent.click(treeItems[0]) // seleciona

    // Act — clicar novamente desseleciona (toggle)
    fireEvent.click(treeItems[0])

    // Assert — todos os arquivos visíveis
    expect(screen.getByText('file1.tar')).toBeInTheDocument()
    expect(screen.getByText('cfg.json')).toBeInTheDocument()
    expect(screen.getByText('readme.txt')).toBeInTheDocument()
  })

  it('FileList permanece funcional quando fetchDirectoryTree falha', async () => {
    // Arrange
    const { fetchDirectoryTree } = await import('./api')
    vi.mocked(fetchDirectoryTree).mockRejectedValueOnce(new Error('Network error'))

    // Act
    render(<App />)

    // Assert — FileList mostra arquivos mesmo sem a árvore
    await waitFor(() => expect(screen.getByText('readme.txt')).toBeInTheDocument())
    expect(screen.queryByText('uploads')).not.toBeInTheDocument()
  })
})
