'use client';

import React, { useState } from 'react';
import FolderTree from '@/components/documents/FolderTree';
import DocGrid from '@/components/documents/DocGrid';
import DocDetail from '@/components/documents/DocDetail';
import UploadModal from '@/components/documents/UploadModal';
import { DriveFile } from '@/components/documents/DocGrid';
// Assuming a TopBar exists based on instructions, or using a placeholder
// import TopBar from '@/components/ui/TopBar';

export default function DocumentsPage() {
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');

  // Placeholder data
  const folders = [
    { id: '1', name: 'Projects', children: [{ id: '2', name: 'Q3 Launch' }] },
    { id: '3', name: 'Personal' }
  ];

  const files: DriveFile[] = [
    { id: 'f1', name: 'Project Brief.pdf', mimeType: 'application/pdf', modifiedTime: '2026-07-28T10:00:00Z', size: '1.2 MB' },
    { id: 'f2', name: 'Budget.xlsx', mimeType: 'application/vnd.google-apps.spreadsheet', modifiedTime: '2026-07-29T10:00:00Z', size: '45 KB' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fafafa' }}>
      {/* <TopBar /> */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left Panel */}
        <div style={{ width: '240px', borderRight: '3px solid #000', overflowY: 'auto' }}>
          <FolderTree 
            folders={folders} 
            activeFolderId={activeFolderId} 
            onFolderSelect={setActiveFolderId} 
          />
        </div>

        {/* Center Panel */}
        <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          <DocGrid 
            files={files}
            viewMode={viewMode}
            sortBy={sortBy}
            onFileSelect={setSelectedFile}
            onViewModeChange={setViewMode}
            onSortChange={setSortBy}
          />

          <button 
            style={{
              position: 'fixed',
              bottom: '32px',
              right: selectedFile ? '392px' : '32px', // Adjust if right panel is open
              padding: '16px 24px',
              border: '2px solid #000',
              background: '#fff',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: '6px 6px 0 #000',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
            onClick={() => setIsUploadOpen(true)}
          >
            UPLOAD
          </button>
        </div>

        {/* Right Panel */}
        {selectedFile && (
          <div style={{ width: '360px', flexShrink: 0 }}>
            <DocDetail file={selectedFile} />
          </div>
        )}
      </div>

      <UploadModal 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        folderId={activeFolderId || undefined}
        onUpload={(file) => console.log('Uploading', file)}
      />
    </div>
  );
}
