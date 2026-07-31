import { NextResponse } from 'next/server';
import { AgentId, AGENT_CAPABILITIES } from '@/lib/agents/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  let interval: NodeJS.Timeout;
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      const sendEvent = (data: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (_err) {
          clearInterval(interval);
        }
      };

      // Heartbeat
      interval = setInterval(() => {
        const randomAgent = AGENT_CAPABILITIES[Math.floor(Math.random() * AGENT_CAPABILITIES.length)];
        sendEvent({
          agentId: randomAgent.id,
          message: `Periodic status update from ${randomAgent.name}.`,
          timestamp: new Date().toISOString(),
          actionType: 'status'
        });
      }, 10000);
    },
    cancel() {
      clearInterval(interval);
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
