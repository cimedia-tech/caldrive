import { NextResponse } from 'next/server';
import { runAgent } from '@/lib/agents/engine';
import { auth } from '@/lib/google/auth';
import { getEvent } from '@/lib/google/calendar';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json().catch(() => ({}));
    const { eventId, calendarId = 'primary' } = body;
    
    let context = '';
    let eventTitle = 'Upcoming Strategic Meeting';

    if (session?.accessToken && eventId) {
      try {
        const event = await getEvent(session.accessToken, calendarId, eventId);
        eventTitle = event.summary || eventTitle;
        context = JSON.stringify({
          title: event.summary,
          start: event.start,
          description: event.description,
          attachments: event.attachments || []
        });
      } catch (err) {
        console.warn('Google Calendar event fetch error, using default context:', err);
      }
    }

    if (!context) {
      context = JSON.stringify({
        title: eventTitle,
        start: new Date().toISOString(),
        description: 'Review project architecture, key metrics, and roadmap deliverables.',
        attachments: [{ title: 'Q3_Product_Roadmap.pdf', mimeType: 'application/pdf' }]
      });
    }
    
    const response = await runAgent('prep-agent', `Prepare a briefing for: ${eventTitle}`, context);
    
    return NextResponse.json({ text: response });
  } catch (error) {
    console.error('Prep agent error:', error);
    return NextResponse.json({ text: 'Unable to prepare briefing at this time.' });
  }
}


