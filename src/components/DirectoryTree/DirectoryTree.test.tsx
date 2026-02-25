import { render, screen, fireEvent } from '@testing-library/react';
import { DirectoryTree } from './DirectoryTree';
import type { DirectoryNode } from '../../types/directory';

// Root path is empty string ''; other paths are forward-slash-separated relative paths (L3)
const tree: DirectoryNode = {
  name: 'uploads',
  path: '',
  children: [
    {
      name: 'backups',
      path: 'backups',
      children: [
        { name: '2025', path: 'backups/2025', children: [] },
      ],
    },
    { name: 'configs', path: 'configs', children: [] },
  ],
};

// NÃO importar describe/it/expect — globals: true no vitest config
describe('DirectoryTree', () => {
  it('renderiza root e filhos diretos no carregamento inicial', () => {
    // Arrange & Act
    render(<DirectoryTree tree={tree} selectedPath={null} onSelect={() => {}} />);

    // Assert
    expect(screen.getByText('uploads')).toBeInTheDocument();
    expect(screen.getByText('backups')).toBeInTheDocument();
    expect(screen.getByText('configs')).toBeInTheDocument();
  });

  it('não renderiza netos até o nó pai ser expandido', () => {
    // Arrange & Act
    render(<DirectoryTree tree={tree} selectedPath={null} onSelect={() => {}} />);

    // Assert
    expect(screen.queryByText('2025')).not.toBeInTheDocument();
  });

  it('expande filhos ao clicar no nó', () => {
    // Arrange
    render(<DirectoryTree tree={tree} selectedPath={null} onSelect={() => {}} />);

    // Act
    fireEvent.click(screen.getByText('backups'));

    // Assert
    expect(screen.getByText('2025')).toBeInTheDocument();
  });

  it('colapsa filhos ao clicar novamente no nó já expandido', () => {
    // Arrange
    render(<DirectoryTree tree={tree} selectedPath={null} onSelect={() => {}} />);
    fireEvent.click(screen.getByText('backups')); // expande

    // Act
    fireEvent.click(screen.getByText('backups')); // colapsa (não está selecionado → toggle ativo)

    // Assert
    expect(screen.queryByText('2025')).not.toBeInTheDocument();
  });

  it('chama onSelect com o path correto ao clicar no nó', () => {
    // Arrange
    const onSelect = vi.fn();
    render(<DirectoryTree tree={tree} selectedPath={null} onSelect={onSelect} />);

    // Act
    fireEvent.click(screen.getByText('configs'));

    // Assert
    expect(onSelect).toHaveBeenCalledWith('configs');
  });

  it('chama onSelect(null) ao clicar no nó já selecionado', () => {
    // Arrange
    const onSelect = vi.fn();
    render(<DirectoryTree tree={tree} selectedPath="backups" onSelect={onSelect} />);

    // Act
    fireEvent.click(screen.getByText('backups'));

    // Assert
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('aplica aria-selected e classe selected no nó correspondente ao selectedPath', () => {
    // Arrange & Act
    render(<DirectoryTree tree={tree} selectedPath="backups" onSelect={() => {}} />);

    // M3 fix: usar role="treeitem" + aria-selected para assertiva robusta
    // (CSS Modules geram hashes — usar substring match no className)
    const selectedNode = screen.getByRole('treeitem', { selected: true });
    expect(selectedNode.textContent).toContain('backups');
    expect(selectedNode.className).toContain('selected');
  });

  it('expandir um nó não reseta a seleção atual', () => {
    // Arrange
    const onSelect = vi.fn();
    render(<DirectoryTree tree={tree} selectedPath="configs" onSelect={onSelect} />);

    // Act — clicar no toggle ▸ de backups (stopPropagation impede onSelect)
    fireEvent.click(screen.getByText('▸'));

    // Assert
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByText('2025')).toBeInTheDocument();
  });

  // M4 — testes adicionais

  it('root começa expandido — ícone ▾ visível para o nó root', () => {
    // Arrange & Act
    render(<DirectoryTree tree={tree} selectedPath={null} onSelect={() => {}} />);

    // Assert — root has children and starts expanded → shows ▾
    const expandedIcons = screen.getAllByText('▾');
    expect(expandedIcons.length).toBeGreaterThan(0);
  });

  it('nó folha (sem filhos) não exibe ícone ▸ ou ▾', () => {
    // Arrange & Act
    render(<DirectoryTree tree={tree} selectedPath={null} onSelect={() => {}} />);

    // Assert — only backups (collapsed child) shows ▸; configs (leaf) has no toggle icon
    const collapseIcons = screen.getAllByText('▸');
    expect(collapseIcons).toHaveLength(1); // só backups
  });

  it('clique no root colapsa a árvore inteira', () => {
    // Arrange
    render(<DirectoryTree tree={tree} selectedPath={null} onSelect={() => {}} />);

    // Act — root starts unselected, click to select+collapse
    fireEvent.click(screen.getByText('uploads'));

    // Assert — root collapsed, direct children no longer visible
    expect(screen.queryByText('backups')).not.toBeInTheDocument();
    expect(screen.queryByText('configs')).not.toBeInTheDocument();
  });

  it('desselecionar nó expandido preserva o estado de expansão (AC5)', () => {
    // Arrange — expand backups first, then simulate parent setting selectedPath
    const onSelect = vi.fn();
    const { rerender } = render(
      <DirectoryTree tree={tree} selectedPath={null} onSelect={onSelect} />
    );
    fireEvent.click(screen.getByText('backups')); // expand + select
    expect(screen.getByText('2025')).toBeInTheDocument();

    // Simulate parent updating selectedPath after first click
    onSelect.mockClear();
    rerender(<DirectoryTree tree={tree} selectedPath="backups" onSelect={onSelect} />);

    // Act — click backups again to deselect (M1 fix: should NOT collapse)
    fireEvent.click(screen.getByText('backups'));

    // Assert — deselected
    expect(onSelect).toHaveBeenCalledWith(null);
    // Assert — expansion preserved per AC5 (2025 still visible)
    expect(screen.getByText('2025')).toBeInTheDocument();
  });
});
