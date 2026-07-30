import { NextResponse } from 'next/server';
import { runAgent } from '@/lib/agents/engine';
import { auth } from '@/lib/google/auth';
import { listEvents } from '@/lib/google/calendar';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.accessToken) return new NextResponse('Unauthorized', { status: 401 });
    
    const body = await request.json();
    const { timeMin, timeMax, calendarId = 'primary' } = body;
    
    const events = await listEvents(session.accessToken, calendarId, timeMin, timeMax);
    
    const context = JSON.stringify((events || []).map((e: any) => ({
      title: e.summary,
      start: e.start,
      end: e.end,
      status: e.status
    })));
    
    const response = await runAgent('calendar-optimizer', 'Analyze this schedule and suggest improvements.', context);
    
    return NextResponse.json({ suggestions: response });
  } catch (error) {
    console.error('Optimizer agent error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

