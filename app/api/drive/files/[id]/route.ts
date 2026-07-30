import { NextResponse } from 'next/server'
import { auth } from '@/lib/google/auth'
import { getFile } from '@/lib/google/drive'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const accessToken = session?.accessToken

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const file = await getFile(accessToken, id)
    return NextResponse.json(file)
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const accessToken = session?.accessToken

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: _id } = await params

  try {
    // TODO: implement delete / trash via Drive API
    return new NextResponse(null, { status: 204 })
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}
