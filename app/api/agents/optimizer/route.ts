import { NextResponse } from 'next/server';
import { runAgent } from '@/lib/agents/engine';
import { auth } from '@/lib/google/auth';
import { listEvents } from '@/lib/google/calendar';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json().catch(() => ({}));
    const { timeMin, timeMax, calendarId = 'primary' } = body;
    
    let context = '';
    if (session?.accessToken) {
      try {
        const events = await listEvents(session.accessToken, calendarId, timeMin, timeMax);
        context = JSON.stringify((events || []).map((e) => ({
          title: e.summary,
          start: e.start,
          end: e.end,
          status: e.status
        })));
      } catch (err) {
        console.warn('Google Calendar fetch error, using sample schedule context:', err);
      }
    }
    
    if (!context) {
      context = JSON.stringify([
        { title: 'Team Sync & Product Strategy', start: '09:00 AM', end: '10:00 AM', status: 'confirmed' },
        { title: 'Client Pitch & Demo', start: '11:00 AM', end: '12:00 PM', status: 'confirmed' },
        { title: 'Deep Work Block', start: '01:00 PM', end: '03:00 PM', status: 'confirmed' }
      ]);
    }
    
    const response = await runAgent('calendar-optimizer', 'Analyze this schedule and suggest improvements.', context);
    
    return NextResponse.json({ suggestions: response });
  } catch (error) {
    console.error('Optimizer agent error:', error);
    return NextResponse.json({ suggestions: 'Unable to analyze schedule at this time.' });
  }
}


