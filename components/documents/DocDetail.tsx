'use client';

import React from 'react';
import styles from './DocDetail.module.css';
import { DriveFile } from './DocGrid';
import LinkedEvents from '@/components/documents/LinkedEvents';

interface DocDetailProps {
  file: DriveFile | null;
}

export default function DocDetail({ file }: DocDetailProps) {
  if (!file) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>Select a document</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {file.webViewLink && (
        <div className={styles.preview}>
          <iframe 
            src={file.webViewLink.replace('/view', '/preview')} 
            className={styles.iframe}
            title={file.name}
          />
        </div>
      )}
      
      <div className={styles.details}>
        <h2 className={styles.title}>{file.name}</h2>
        
        <div className={styles.metadata}>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>TYPE</span>
            <span className={styles.metaValue}>{file.mimeType}</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>SIZE</span>
            <span className={styles.metaValue}>{file.size || '--'}</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>OWNER</span>
            <span className={styles.metaValue}>{file.owner || 'Me'}</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>LAST MODIFIED</span>
            <span className={styles.metaValue}>{new Date(file.modifiedTime).toLocaleString()}</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>SHARING STATUS</span>
            <span className={styles.metaValue}>{file.shared ? 'Shared' : 'Private'}</span>
          </div>
        </div>

        <LinkedEvents fileUrl={file.webViewLink || ''} />

        <div className={styles.section}>
          <h3 className={styles.sectionHeader}>TAGS</h3>
          <div className={styles.tagsRow}>
            <button className={styles.addTagBtn}>+ Add tag</button>
          </div>
        </div>

        <div className={styles.actions}>
          <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" className={styles.btnOutline}>
            Open in Drive
          </a>
          <button className={styles.btnOutline}>Share</button>
        </div>
      </div>
    </div>
  );
}
