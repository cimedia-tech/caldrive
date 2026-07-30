import { NextResponse } from 'next/server'
import { auth } from '@/lib/google/auth'
import { listCalendars } from '@/lib/google/calendar'

export async function GET() {
  const session = await auth()
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const calendars = await listCalendars(session.accessToken)
    return NextResponse.json(calendars)
  } catch (error) {
    console.error('Error fetching calendars:', error)
    return NextResponse.json({ error: 'Failed to fetch calendars' }, { status: 500 })
  }
}
