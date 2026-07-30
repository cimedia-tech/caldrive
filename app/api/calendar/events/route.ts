import { NextResponse } from 'next/server'
import { auth } from '@/lib/google/auth'
import { listEvents, createEvent } from '@/lib/google/calendar'

export async function GET(request: Request) {
  const session = await auth()
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const calendarId = searchParams.get('calendarId') || 'primary'
  const timeMin = searchParams.get('timeMin') || new Date().toISOString()
  const timeMax = searchParams.get('timeMax') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  try {
    const events = await listEvents(session.accessToken, calendarId, timeMin, timeMax)
    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { calendarId = 'primary', ...eventData } = body
    
    const createdEvent = await createEvent(session.accessToken, calendarId, eventData)
    return NextResponse.json(createdEvent, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
