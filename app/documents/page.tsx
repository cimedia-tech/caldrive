'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TopBar from '@/components/layout/TopBar';
import FolderTree from '@/components/documents/FolderTree';
import DocGrid from '@/components/documents/DocGrid';
import DocDetail from '@/components/documents/DocDetail';
import UploadModal from '@/components/documents/UploadModal';
import { DriveFile } from '@/components/documents/DocGrid';
import { useSettingsStore } from '@/lib/store/settings-store';

// Placeholder library shown when Google Drive is not connected
const PLACEHOLDER_FOLDERS = [
  { id: 'root', name: 'My Drive', children: [] as { id: string; name: string }[] },
  { id: '1', name: 'Projects', children: [{ id: '2', name: 'Q3 Launch' }] },
  { id: '3', name: 'Personal' }
];

const PLACEHOLDER_FILES: (DriveFile & { folderId?: string })[] = [
  { id: 'f1', name: 'Project Brief.pdf', mimeType: 'application/pdf', modifiedTime: '2026-07-28T10:00:00Z', size: '1.2 MB', folderId: '2' },
  { id: 'f2', name: 'Budget.xlsx', mimeType: 'application/vnd.google-apps.spreadsheet', modifiedTime: '2026-07-29T10:00:00Z', size: '45 KB', folderId: '2' }
];

function parseSize(size?: string): number {
  if (!size) return 0;
  const num = parseFloat(size);
  if (Number.isNaN(num)) return 0;
  const s = size.toUpperCase();
  if (s.includes('GB')) return num * 1024 * 1024 * 1024;
  if (s.includes('MB')) return num * 1024 * 1024;
  if (s.includes('KB')) return num * 1024;
  return num;
}

function findFolderPath(
  folders: { id: string; name: string; children?: { id: string; name: string }[] }[],
  targetId: string | null
): { id: string; name: string }[] {
  if (!targetId) return [];
  for (const folder of folders) {
    if (folder.id === targetId) return [{ id: folder.id, name: folder.name }];
    if (folder.children) {
      const childPath = findFolderPath(folder.children, targetId);
      if (childPath.length > 0) return [{ id: folder.id, name: folder.name }, ...childPath];
    }
  }
  return [];
}

function DocumentsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const docsViewMode = useSettingsStore((s) => s.docsViewMode);
  const docsSortBy = useSettingsStore((s) => s.docsSortBy);

  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  // Deep link support: /documents?upload=1 opens the upload modal
  const [isUploadOpen, setIsUploadOpen] = useState(() => searchParams.get('upload') === '1');
  // null = follow the Settings default; a value = user changed it this session
  const [viewOverride, setViewOverride] = useState<'grid' | 'list' | null>(null);
  const [sortOverride, setSortOverride] = useState<string | null>(null);
  const viewMode = viewOverride ?? docsViewMode;
  const sortBy = sortOverride ?? docsSortBy;
  const [files, setFiles] = useState<(DriveFile & { folderId?: string })[]>(PLACEHOLDER_FILES);

  // Clean the deep-link param from the URL after consuming it
  useEffect(() => {
    if (searchParams.get('upload') === '1') {
      router.replace('/documents');
    }
  }, [searchParams, router]);

  // Try live Drive data; keep placeholders if the API isn't configured
  useEffect(() => {
    fetch('/api/drive/files')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.files?.length) setFiles(data.files);
      })
      .catch(() => { /* not connected — placeholders remain */ });
  }, []);

  const visibleFiles = useMemo(() => {
    const filtered = activeFolderId
      ? files.filter(f => f.folderId === activeFolderId || f.parents?.includes(activeFolderId))
      : files;
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'modifiedTime':
          return new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime();
        case 'size':
          return parseSize(b.size) - parseSize(a.size);
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return sorted;
  }, [files, activeFolderId, sortBy]);

  const breadcrumbs = useMemo(() => {
    const path = findFolderPath(PLACEHOLDER_FOLDERS, activeFolderId);
    return ['MY DRIVE', ...path.filter(p => p.id !== 'root').map(p => p.name.toUpperCase())].join(' / ');
  }, [activeFolderId]);

  return (
    <div className="flex flex-col h-screen bg-app">
      <TopBar title="DOCUMENTS" />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left Panel */}
        <div style={{ width: '240px', borderRight: '3px solid var(--border)', overflowY: 'auto' }}>
          <FolderTree
            folders={PLACEHOLDER_FOLDERS}
            activeFolderId={activeFolderId}
            onFolderSelect={setActiveFolderId}
          />
        </div>

        {/* Center Panel */}
        <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          <DocGrid
            files={visibleFiles}
            breadcrumbs={breadcrumbs}
            viewMode={viewMode}
            sortBy={sortBy}
            onFileSelect={setSelectedFile}
            onViewModeChange={setViewOverride}
            onSortChange={setSortOverride}
          />

          <button
            className="btn shadow-card"
            style={{
              position: 'fixed',
              bottom: '32px',
              right: selectedFile ? '392px' : '32px',
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

export default function DocumentsPage() {
  return (
    <Suspense>
      <DocumentsPageInner />
    </Suspense>
  );
}
