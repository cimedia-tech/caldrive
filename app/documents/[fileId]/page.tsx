'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import DocDetail from '@/components/documents/DocDetail';
import { DriveFile } from '@/components/documents/DocGrid';

export default function DocumentDetailPage() {
  const params = useParams();
  const fileId = params.fileId as string;

  // Placeholder file
  const file: DriveFile = {
    id: fileId,
    name: 'Sample Document.pdf',
    mimeType: 'application/pdf',
    modifiedTime: new Date().toISOString(),
    size: '2.5 MB'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#fafafa' }}>
      <div style={{ flex: 1 }}>
        <DocDetail file={file} />
      </div>
    </div>
  );
}
