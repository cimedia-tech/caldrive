'use client';

import React from 'react';
import styles from './DocCard.module.css';
import { DriveFile } from './DocGrid';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

interface DocCardProps {
  file: DriveFile;
  tags?: Tag[];
  onClick: () => void;
}

export default function DocCard({ file, tags, onClick }: DocCardProps) {
  let icon = '📄';
  let iconColor = '#4a6fa5';

  if (file.mimeType.includes('document')) { icon = '📝'; iconColor = '#4a6fa5'; }
  else if (file.mimeType.includes('spreadsheet')) { icon = '📊'; iconColor = '#2d5f3f'; }
  else if (file.mimeType.includes('presentation')) { icon = '🖥️'; iconColor = '#d4a030'; }
  else if (file.mimeType.includes('pdf')) { icon = '📕'; iconColor = '#c45d3e'; }
  else if (file.mimeType.includes('image')) { icon = '🖼️'; iconColor = '#4a6fa5'; }
  else if (file.mimeType.includes('folder')) { icon = '📁'; iconColor = '#2d5f3f'; }

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.preview}>
        <span className={styles.typeIcon} style={{ color: iconColor }}>{icon}</span>
      </div>
      <div className={styles.info}>
        <div className={styles.name}>{file.name}</div>
        <div className={styles.meta}>
          {new Date(file.modifiedTime).toLocaleDateString()}
          {file.size ? ` · ${file.size}` : ''}
        </div>
        {tags && tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map(tag => (
              <span 
                key={tag.id} 
                className={styles.tag} 
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
