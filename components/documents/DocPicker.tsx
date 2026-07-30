/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState } from 'react';
import styles from './DocPicker.module.css';
import { DriveFile } from './DocGrid';

interface DocPickerProps {
  selectedFiles: DriveFile[];
  onSelect: (file: DriveFile) => void;
  onRemove: (fileId: string) => void;
}

export default function DocPicker({ selectedFiles, onSelect, onRemove }: DocPickerProps) {
  const [query, setQuery] = useState('');

  return (
    <div className={styles.container}>
      <input 
        type="text" 
        className={styles.searchInput} 
        placeholder="Search documents..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      
      <div className={styles.chips}>
        {selectedFiles.map(file => (
          <div key={file.id} className={styles.chip}>
            <span className={styles.chipName}>{file.name}</span>
            <button className={styles.chipRemove} onClick={() => onRemove(file.id)}>×</button>
          </div>
        ))}
      </div>

      <button className={styles.browseBtn}>
        + Browse Drive
      </button>
    </div>
  );
}
