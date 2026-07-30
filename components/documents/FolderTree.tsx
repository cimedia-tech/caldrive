'use client';

import React, { useState } from 'react';
import styles from './FolderTree.module.css';

export interface FolderNode {
  id: string;
  name: string;
  children?: FolderNode[];
}

interface FolderTreeProps {
  folders: FolderNode[];
  activeFolderId: string | null;
  onFolderSelect: (id: string) => void;
}

const TreeNode: React.FC<{
  node: FolderNode;
  activeId: string | null;
  onSelect: (id: string) => void;
  level: number;
}> = ({ node, activeId, onSelect, level }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div>
      <div 
        className={`${styles.folder} ${activeId === node.id ? styles.folderActive : ''}`}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => onSelect(node.id)}
      >
        <button 
          className={styles.toggle}
          onClick={handleToggle}
          style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
        >
          {expanded ? '▼' : '▶'}
        </button>
        <span className={styles.folderName}>{node.name}</span>
      </div>
      {expanded && hasChildren && (
        <div className={styles.children}>
          {node.children!.map(child => (
            <TreeNode 
              key={child.id} 
              node={child} 
              activeId={activeId} 
              onSelect={onSelect} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function FolderTree({ folders, activeFolderId, onFolderSelect }: FolderTreeProps) {
  return (
    <div className={styles.tree}>
      <div className={styles.rootLabel}>MY DRIVE</div>
      {folders.map(folder => (
        <TreeNode 
          key={folder.id} 
          node={folder} 
          activeId={activeFolderId} 
          onSelect={onFolderSelect} 
          level={0} 
        />
      ))}
    </div>
  );
}
