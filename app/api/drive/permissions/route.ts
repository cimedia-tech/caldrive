/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { auth } from '@/lib/google/auth';
import { shareFile } from '@/lib/google/drive';

export async function POST(req: Request) {
  const session = await auth();
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const permission = await shareFile(accessToken, body.fileId, body.email, body.role);
    return NextResponse.json(permission);
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to share file' }, { status: 500 });
  }
}
