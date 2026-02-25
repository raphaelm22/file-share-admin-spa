import { useEffect, useState } from 'react';
import type { DirectoryNode } from '../../types/directory';
import { DirectoryTreeNode } from './DirectoryTreeNode';
import styles from './DirectoryTree.module.scss';

interface DirectoryTreeProps {
  tree: DirectoryNode;
  selectedPath: string | null;
  onSelect: (path: string | null) => void;
}

export function DirectoryTree({ tree, selectedPath, onSelect }: DirectoryTreeProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    () => new Set([tree.path])
  );

  // L2: Reset expansion when the monitored root changes (e.g. story 7.3 loads a new tree)
  useEffect(() => {
    setExpandedPaths(new Set([tree.path]));
  }, [tree.path]);

  const handleToggle = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  };

  const handleSelect = (path: string) => {
    onSelect(path === selectedPath ? null : path);
  };

  return (
    <div className={styles.tree} role="tree">
      <DirectoryTreeNode
        node={tree}
        depth={0}
        selectedPath={selectedPath}
        expandedPaths={expandedPaths}
        onSelect={handleSelect}
        onToggle={handleToggle}
      />
    </div>
  );
}
