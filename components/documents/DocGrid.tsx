'use client';

import React from 'react';
import styles from './DocGrid.module.css';
import DocCard from './DocCard';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink?: string;
  shared?: boolean;
  owner?: string;
  parents?: string[];
}

interface DocGridProps {
  files: DriveFile[];
  breadcrumbs?: string;
  viewMode: 'grid' | 'list';
  sortBy: string;
  onFileSelect: (file: DriveFile) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onSortChange: (sort: string) => void;
}

export default function DocGrid({
  files,
  breadcrumbs,
  viewMode,
  sortBy,
  onFileSelect,
  onViewModeChange,
  onSortChange
}: DocGridProps) {
  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.breadcrumbs}>
          {breadcrumbs || 'MY DRIVE'}
        </div>
        <div className={styles.controls}>
          <div className={styles.viewToggle}>
            <button 
              className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => onViewModeChange('grid')}
            >
              GRID
            </button>
            <button 
              className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => onViewModeChange('list')}
            >
              LIST
            </button>
          </div>
          <select 
            className={styles.sortSelect} 
            value={sortBy} 
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="name">NAME</option>
            <option value="modifiedTime">MODIFIED</option>
            <option value="size">SIZE</option>
          </select>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className={styles.grid}>
          {files.map(file => (
            <DocCard key={file.id} file={file} onClick={() => onFileSelect(file)} />
          ))}
        </div>
      ) : (
        <div className={styles.list}>
          <div className={styles.listHeader}>
            <div className={styles.colName}>NAME</div>
            <div className={styles.colDate}>MODIFIED</div>
            <div className={styles.colSize}>SIZE</div>
            <div className={styles.colShared}>SHARING</div>
          </div>
          <div className={styles.listBody}>
            {files.map(file => (
              <div key={file.id} className={styles.listRow} onClick={() => onFileSelect(file)}>
                <div className={styles.colName}>
                  <span className={styles.icon}>📄</span>
                  <span className={styles.nameText}>{file.name}</span>
                </div>
                <div className={styles.colDate}>{new Date(file.modifiedTime).toLocaleDateString()}</div>
                <div className={styles.colSize}>{file.size || '--'}</div>
                <div className={styles.colShared}>{file.shared ? 'Shared' : 'Private'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
