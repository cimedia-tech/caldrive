import { NextResponse } from 'next/server'
import { auth } from '@/lib/google/auth'
import { getFreeBusy } from '@/lib/google/calendar'

export async function POST(request: Request) {
  const session = await auth()
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { calendars, timeMin, timeMax } = await request.json()
    
    const freebusy = await getFreeBusy(session.accessToken, calendars, timeMin, timeMax)
    return NextResponse.json(freebusy)
  } catch (error) {
    console.error('Error getting freebusy:', error)
    return NextResponse.json({ error: 'Failed to get freebusy info' }, { status: 500 })
  }
}
