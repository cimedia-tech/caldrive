import { NextResponse } from 'next/server';
import { runAgent } from '@/lib/agents/engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId, message, context } = body;
    
    if (!agentId || !message) {
      return new NextResponse('Missing required fields', { status: 400 });
    }
    
    const response = await runAgent(agentId, message, context);
    
    return NextResponse.json({
      response,
      agentId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
