/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { auth } from '@/lib/google/auth';
import { listFiles, searchFiles } from '@/lib/google/drive';

export async function GET(req: Request) {
  const session = await auth();
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get('folderId') || undefined;
  const q = searchParams.get('q') || undefined;
  const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : undefined;
  const pageToken = searchParams.get('pageToken') || undefined;

   try {
    let result;
    if (q) {
      result = await searchFiles(accessToken, q);
    } else {
      result = await listFiles(accessToken, folderId, undefined, pageSize, pageToken);
    }
    return NextResponse.json(result);
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}

export async function POST(_req: Request) {
  const session = await auth();
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // TODO: Implement multipart form data parsing for file upload
    return NextResponse.json({ id: 'new-id', name: 'upload.txt' }, { status: 201 });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
