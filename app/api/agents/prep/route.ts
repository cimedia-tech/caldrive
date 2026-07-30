import { NextResponse } from 'next/server';
import { runAgent } from '@/lib/agents/engine';
import { auth } from '@/lib/google/auth';
import { getEvent } from '@/lib/google/calendar';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.accessToken) return new NextResponse('Unauthorized', { status: 401 });
    
    const body = await request.json();
    const { eventId, calendarId = 'primary' } = body;
    
    const event = await getEvent(session.accessToken, calendarId, eventId);
    
    const context = JSON.stringify({
      title: event.summary,
      start: event.start,
      description: event.description,
      attachments: event.attachments || []
    });
    
    const response = await runAgent('prep-agent', `Prepare a briefing for: ${event.summary || 'Meeting'}`, context);
    
    return NextResponse.json({ text: response });
  } catch (error) {
    console.error('Prep agent error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

