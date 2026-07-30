import { NextResponse } from 'next/server';
import { runAgent } from '@/lib/agents/engine';
import { auth } from '@/lib/google/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.accessToken) return new NextResponse('Unauthorized', { status: 401 });
    
    const body = await request.json();
    const { query } = body;
    
    const response = await runAgent('search-intelligence', `Search results for: ${query}`, 'MOCK CONTEXT');
    
    return NextResponse.json({ 
      events: [], 
      files: [], 
      summary: response 
    });
  } catch (error) {
    console.error('Search agent error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

