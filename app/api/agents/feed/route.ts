import { NextResponse } from 'next/server';
import { AgentId, AGENT_CAPABILITIES } from '@/lib/agents/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}

`));
      };

      // Heartbeat
      const interval = setInterval(() => {
        const randomAgent = AGENT_CAPABILITIES[Math.floor(Math.random() * AGENT_CAPABILITIES.length)];
        sendEvent({
          agentId: randomAgent.id,
          message: `Periodic status update from ${randomAgent.name}.`,
          timestamp: new Date().toISOString(),
          actionType: 'status'
        });
      }, 10000);
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
