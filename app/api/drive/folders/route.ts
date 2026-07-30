/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { auth } from '@/lib/google/auth';
import { createFolder } from '@/lib/google/drive';

export async function GET(req: Request) {
  const session = await auth();
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const _rootId = searchParams.get('rootId') || 'root';

  try {
    // TODO: Implement actual folder tree fetching
    return NextResponse.json({ folders: [] });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const folder = await createFolder(accessToken, body.name, body.parentId);
    return NextResponse.json(folder, { status: 201 });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}
