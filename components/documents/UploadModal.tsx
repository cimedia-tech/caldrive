/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useRef } from 'react';
import styles from './UploadModal.module.css';

// Using a placeholder Modal component
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId?: string;
  onUpload: (file: File) => void;
}

export default function UploadModal({ isOpen, onClose, folderId, onUpload }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h2 className={styles.title}>UPLOAD FILES</h2>
        
        <div 
          className={styles.dropZone}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          {selectedFile ? (
            <div className={styles.fileInfo}>
              <span className={styles.icon}>📄</span>
              <span className={styles.fileName}>{selectedFile.name}</span>
              <span className={styles.fileSize}>{(selectedFile.size / 1024).toFixed(1)} KB</span>
            </div>
          ) : (
            <span className={styles.dropText}>Drag files here or click to browse</span>
          )}
          <input 
            type="file" 
            className={styles.hiddenInput}
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
            }}
          />
        </div>

        {selectedFile && (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}></div>
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={() => selectedFile && onUpload(selectedFile)} disabled={!selectedFile}>
            UPLOAD
          </button>
        </div>
      </div>
    </Modal>
  );
}
