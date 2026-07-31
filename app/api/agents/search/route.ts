import { NextResponse } from 'next/server';
import { runAgent } from '@/lib/agents/engine';
import { auth } from '@/lib/google/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { query = '' } = body;
    
    const response = await runAgent('search-intelligence', query ? `Search results for: ${query}` : 'General search overview', 'SEARCH_CONTEXT');
    
    return NextResponse.json({ 
      events: [], 
      files: [], 
      summary: response 
    });
  } catch (error) {
    console.error('Search agent error:', error);
    return NextResponse.json({ 
      events: [], 
      files: [], 
      summary: 'Search intelligence unavailable.' 
    });
  }
}


