import type { DirectoryNode } from '../../types/directory';
import styles from './DirectoryTree.module.scss';

function toggleIcon(hasChildren: boolean, isExpanded: boolean): string {
  if (!hasChildren) return ' ';
  return isExpanded ? '▾' : '▸';
}

interface DirectoryTreeNodeProps {
  node: DirectoryNode;
  depth: number;
  selectedPath: string | null;
  expandedPaths: Set<string>;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
}

export function DirectoryTreeNode({
  node, depth, selectedPath, expandedPaths, onSelect, onToggle,
}: DirectoryTreeNodeProps) {
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;
  const hasChildren = node.children.length > 0;

  // M1: Only toggle expansion when SELECTING (not deselecting) — preserves expansion state
  // per AC5: "estado de expansão não deve resetar ao mudar seleção"
  const handleActivate = () => {
    onSelect(node.path);
    if (hasChildren && !isSelected) {
      onToggle(node.path);
    }
  };

  return (
    <div>
      <div
        role="treeitem"
        tabIndex={0}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
        className={[styles.node, isSelected && styles.selected].filter(Boolean).join(' ')}
        style={{ paddingLeft: `${depth * 16}px` }}
        onClick={handleActivate}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleActivate();
          }
        }}
      >
        <span
          className={styles.toggle}
          onClick={e => { e.stopPropagation(); if (hasChildren) onToggle(node.path); }}
          aria-hidden="true"
        >
          {toggleIcon(hasChildren, isExpanded)}
        </span>
        <span>[DIR]</span> {node.name}
      </div>
      {isExpanded && node.children.map(child => (
        <DirectoryTreeNode
          key={child.path}
          node={child}
          depth={depth + 1}
          selectedPath={selectedPath}
          expandedPaths={expandedPaths}
          onSelect={onSelect}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
