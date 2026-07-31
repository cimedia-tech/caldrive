import { NextResponse } from 'next/server';
import { AGENT_CAPABILITIES } from '@/lib/agents/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Max 30 seconds for serverless stream

export async function GET() {
  let interval: NodeJS.Timeout;
  let timeout: NodeJS.Timeout;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      const sendEvent = (data: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (_err) {
          clearInterval(interval);
          clearTimeout(timeout);
        }
      };

      // Send initial event
      const initialAgent = AGENT_CAPABILITIES[0];
      sendEvent({
        agentId: initialAgent.id,
        message: `Agent feed initialized. Monitoring active workspace tasks.`,
        timestamp: new Date().toISOString(),
        actionType: 'status'
      });

      // Heartbeat every 8s
      interval = setInterval(() => {
        const randomAgent = AGENT_CAPABILITIES[Math.floor(Math.random() * AGENT_CAPABILITIES.length)];
        sendEvent({
          agentId: randomAgent.id,
          message: `Periodic status update from ${randomAgent.name}.`,
          timestamp: new Date().toISOString(),
          actionType: 'status'
        });
      }, 8000);

      // Auto-close before Vercel timeout (25 seconds)
      timeout = setTimeout(() => {
        clearInterval(interval);
        try {
          controller.close();
        } catch (_err) {
          // ignore already closed stream
        }
      }, 25000);
    },
    cancel() {
      clearInterval(interval);
      clearTimeout(timeout);
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

