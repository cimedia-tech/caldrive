import os

base_dir = r'C:\Users\Augustus\caldrive'

files = {
    r'app\api\calendar\events\[id]\attachments\route.ts': '''import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getEvent, updateEvent } from '@/lib/google/calendar';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.accessToken) return new NextResponse('Unauthorized', { status: 401 });
    
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const calendarId = searchParams.get('calendarId') || 'primary';
    
    const event = await getEvent(session.accessToken, calendarId, id);
    return NextResponse.json(event.attachments || []);
  } catch (error) {
    console.error('Error fetching attachments:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.accessToken) return new NextResponse('Unauthorized', { status: 401 });
    
    const { id } = await params;
    const body = await request.json();
    const { calendarId = 'primary', fileUrl, title, mimeType } = body;
    
    const event = await getEvent(session.accessToken, calendarId, id);
    const attachments = event.attachments || [];
    
    const newAttachment = {
      fileUrl,
      title,
      mimeType,
      iconLink: '' // Optional
    };
    
    const updatedAttachments = [...attachments, newAttachment];
    
    const updatedEvent = await updateEvent(session.accessToken, calendarId, id, {
      ...event,
      attachments: updatedAttachments
    });
    
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error adding attachment:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.accessToken) return new NextResponse('Unauthorized', { status: 401 });
    
    const { id } = await params;
    const body = await request.json();
    const { calendarId = 'primary', fileUrl } = body;
    
    const event = await getEvent(session.accessToken, calendarId, id);
    const attachments = event.attachments || [];
    
    const updatedAttachments = attachments.filter((a: any) => a.fileUrl !== fileUrl);
    
    const updatedEvent = await updateEvent(session.accessToken, calendarId, id, {
      ...event,
      attachments: updatedAttachments
    });
    
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error removing attachment:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
''',
    r'components\calendar\AttachedDocuments.tsx': '''"use client";

import React, { useEffect, useState } from "react";
import styles from "./AttachedDocuments.module.css";
import Button from "@/components/ui/Button";

interface AttachedDocumentsProps {
  eventId: string;
  calendarId?: string;
}

export default function AttachedDocuments({ eventId, calendarId = "primary" }: AttachedDocumentsProps) {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const fetchAttachments = async () => {
    try {
      const res = await fetch(`/api/calendar/events/${eventId}/attachments?calendarId=${calendarId}`);
      if (res.ok) {
        const data = await res.json();
        setAttachments(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [eventId, calendarId]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/drive/files?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const attachFile = async (file: any) => {
    try {
      const res = await fetch(`/api/calendar/events/${eventId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendarId,
          fileUrl: file.webViewLink,
          title: file.name,
          mimeType: file.mimeType,
        }),
      });
      if (res.ok) {
        setIsSearching(false);
        setSearchQuery("");
        fetchAttachments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const removeAttachment = async (fileUrl: string) => {
    try {
      const res = await fetch(`/api/calendar/events/${eventId}/attachments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calendarId, fileUrl }),
      });
      if (res.ok) fetchAttachments();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>ATTACHED DOCUMENTS</h3>
      
      {loading ? (
        <div className={styles.empty}>Loading...</div>
      ) : attachments.length > 0 ? (
        <div className={styles.list}>
          {attachments.map((att, i) => (
            <div key={i} className={styles.row}>
              <a href={att.fileUrl} target="_blank" rel="noreferrer" className={styles.link}>
                {att.title}
              </a>
              <button className={styles.removeBtn} onClick={() => removeAttachment(att.fileUrl)}>X</button>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>No attachments</div>
      )}

      {isSearching ? (
        <div className={styles.searchBox}>
          <input 
            type="text" 
            placeholder="Search Drive files..." 
            value={searchQuery}
            onChange={handleSearch}
            className={styles.input}
          />
          {searchResults.length > 0 && (
            <div className={styles.results}>
              {searchResults.map((r, i) => (
                <div key={i} className={styles.resultItem} onClick={() => attachFile(r)}>
                  {r.name}
                </div>
              ))}
            </div>
          )}
          <Button variant="ghost" onClick={() => setIsSearching(false)}>CANCEL</Button>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setIsSearching(true)} className={styles.attachBtn}>
          + ATTACH FROM DRIVE
        </Button>
      )}
    </div>
  );
}
''',
    r'components\calendar\AttachedDocuments.module.css': '''.container {
  margin-top: var(--space-4);
}
.heading {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-2);
  margin-bottom: var(--space-3);
}
.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2);
  border: 1px solid var(--color-border);
}
.link {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-foreground);
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
}
.removeBtn {
  background: none;
  border: none;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0 var(--space-1);
}
.empty {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.875rem;
  color: var(--color-foreground);
  opacity: 0.7;
  margin-bottom: var(--space-3);
}
.attachBtn {
  width: 100%;
}
.searchBox {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-3);
}
.input {
  padding: var(--space-2);
  border: 2px solid var(--color-border);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  outline: none;
  border-radius: 0;
}
.input:focus {
  border-color: var(--color-navy);
}
.results {
  border: 2px solid var(--color-border);
  max-height: 150px;
  overflow-y: auto;
}
.resultItem {
  padding: var(--space-2);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
}
.resultItem:last-child {
  border-bottom: none;
}
.resultItem:hover {
  background-color: var(--color-background);
}
''',
    r'components\documents\LinkedEvents.tsx': '''"use client";

import React, { useEffect, useState } from "react";
import styles from "./LinkedEvents.module.css";
import Link from "next/link";

interface LinkedEventsProps {
  fileUrl: string;
}

export default function LinkedEvents({ fileUrl }: LinkedEventsProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const timeMin = new Date();
        timeMin.setDate(timeMin.getDate() - 30);
        const timeMax = new Date();
        timeMax.setDate(timeMax.getDate() + 30);
        
        const res = await fetch(`/api/calendar/events?calendarId=primary&timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}`);
        if (res.ok) {
          const data = await res.json();
          const linked = data.filter((ev: any) => 
            ev.attachments?.some((att: any) => att.fileUrl === fileUrl)
          );
          setEvents(linked);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    if (fileUrl) fetchEvents();
  }, [fileUrl]);

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>LINKED EVENTS</h3>
      
      {loading ? (
        <div className={styles.empty}>Searching...</div>
      ) : events.length > 0 ? (
        <div className={styles.list}>
          {events.map((ev) => (
            <Link key={ev.id} href={`/calendar/${ev.id}`} className={styles.eventRow}>
              <span className={styles.date}>
                {new Date(ev.start?.dateTime || ev.start?.date || "").toLocaleDateString()}
              </span>
              <span className={styles.title}>{ev.summary || "(No title)"}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>No linked events</div>
      )}
    </div>
  );
}
''',
    r'components\documents\LinkedEvents.module.css': '''.container {
  margin-top: var(--space-6);
}
.heading {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-2);
  margin-bottom: var(--space-3);
}
.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.eventRow {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  text-decoration: none;
  color: var(--color-foreground);
  transition: all 0.2s;
}
.eventRow:hover {
  background-color: var(--color-background);
  transform: translate(-2px, -2px);
  box-shadow: 2px 2px 0 var(--color-border);
}
.date {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  opacity: 0.8;
  white-space: nowrap;
}
.title {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 600;
}
.empty {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.875rem;
  color: var(--color-foreground);
  opacity: 0.7;
}
''',
    r'lib\agents\types.ts': '''export type AgentId = 'prep-agent' | 'sync-agent' | 'content-agent' | 'calendar-optimizer' | 'search-intelligence' | 'workflow-automator';

export interface AgentMessage {
  id: string;
  agentId: AgentId;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    relatedEventIds?: string[];
    relatedFileIds?: string[];
    suggestions?: string[];
  };
}

export interface AgentCapability {
  id: AgentId;
  name: string;
  description: string;
  triggers: string[];
  color: string;
  icon: string;
}

export const AGENT_CAPABILITIES: AgentCapability[] = [
  { id: 'prep-agent', name: 'Prep Agent', description: 'Assembles document briefings before meetings', triggers: ['meeting in 30 min', 'event starting soon'], color: 'var(--color-navy)', icon: 'briefcase' },
  { id: 'sync-agent', name: 'Sync Agent', description: 'Monitors Drive for changes and notifies', triggers: ['file modified', 'new file in folder'], color: 'var(--color-forest)', icon: 'refresh' },
  { id: 'content-agent', name: 'Content Agent', description: 'Generates meeting recaps and document summaries', triggers: ['meeting ended', 'summarize document'], color: 'var(--color-amber)', icon: 'edit' },
  { id: 'calendar-optimizer', name: 'Calendar Optimizer', description: 'Suggests schedule improvements and finds focus blocks', triggers: ['schedule analysis', 'find free time'], color: 'var(--color-terracotta)', icon: 'clock' },
  { id: 'search-intelligence', name: 'Search Intelligence', description: 'Cross-domain search across events and documents', triggers: ['search query', 'find related'], color: 'var(--color-steel)', icon: 'search' },
  { id: 'workflow-automator', name: 'Workflow Automator', description: 'Chains automated actions across calendar and drive', triggers: ['auto-create folder', 'schedule follow-up'], color: 'var(--color-burgundy)', icon: 'zap' },
];
''',
    r'lib\agents\engine.ts': '''import { GoogleGenerativeAI } from '@google/generative-ai';
import { AgentId, AGENT_CAPABILITIES } from './types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function runAgent(agentId: AgentId, prompt: string, context?: string): Promise<string> {
  const capability = AGENT_CAPABILITIES.find(a => a.id === agentId);
  if (!capability) throw new Error(`Unknown agent: ${agentId}`);

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const systemPrompt = `You are ${capability.name}, an AI agent for CalDrive.
Role: ${capability.description}
Respond concisely and actionably. Use bullet points for lists. Be direct.`;

  const fullPrompt = context 
    ? `${systemPrompt}\\n\\nContext:\\n${context}\\n\\nUser request: ${prompt}` 
    : `${systemPrompt}\\n\\nUser request: ${prompt}`;

  try {
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  } catch (error) {
    console.error('Agent generation failed:', error);
    return "Error: Agent generation failed.";
  }
}
''',
    r'app\api\agents\chat\route.ts': '''import { NextResponse } from 'next/server';
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
''',
    r'app\api\agents\feed\route.ts': '''import { NextResponse } from 'next/server';
import { AgentId, AGENT_CAPABILITIES } from '@/lib/agents/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
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
''',
    r'app\api\agents\prep\route.ts': '''import { NextResponse } from 'next/server';
import { runAgent } from '@/lib/agents/engine';
import { auth } from '@/auth';
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
''',
    r'app\api\agents\optimizer\route.ts': '''import { NextResponse } from 'next/server';
import { runAgent } from '@/lib/agents/engine';
import { auth } from '@/auth';
import { listEvents } from '@/lib/google/calendar';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.accessToken) return new NextResponse('Unauthorized', { status: 401 });
    
    const body = await request.json();
    const { timeMin, timeMax, calendarId = 'primary' } = body;
    
    const events = await listEvents(session.accessToken, calendarId, timeMin, timeMax);
    
    const context = JSON.stringify(events.items.map((e: any) => ({
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
''',
    r'app\api\agents\search\route.ts': '''import { NextResponse } from 'next/server';
import { runAgent } from '@/lib/agents/engine';
import { auth } from '@/auth';

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
''',
    r'components\agents\AgentCard.tsx': '''"use client";

import React from "react";
import styles from "./AgentCard.module.css";
import Toggle from "@/components/ui/Toggle";

interface AgentCardProps {
  agent: any; 
  onToggle: (id: string, active: boolean) => void;
  onClick: (id: string) => void;
}

export default function AgentCard({ agent, onToggle, onClick }: AgentCardProps) {
  return (
    <div 
      className={styles.card} 
      style={{ borderLeftColor: agent.color }}
      onClick={() => onClick(agent.id)}
    >
      <div className={styles.header}>
        <div className={styles.name}>{agent.name}</div>
        <div onClick={(e) => e.stopPropagation()}>
          <Toggle checked={agent.active} onChange={(checked) => onToggle(agent.id, checked)} />
        </div>
      </div>
      <div className={styles.description}>{agent.description}</div>
      <div className={styles.status}>
        {agent.status === 'processing' ? (
          <span className={styles.processing}>
            <span className={styles.spinner}></span> PROCESSING
          </span>
        ) : agent.active ? (
          <span className={styles.active}>ACTIVE</span>
        ) : (
          <span className={styles.idle}>IDLE</span>
        )}
      </div>
    </div>
  );
}
''',
    r'components\agents\AgentCard.module.css': '''.card {
  border: 2px solid var(--color-border);
  border-left-width: 4px;
  background-color: var(--color-surface);
  padding: var(--space-4);
  box-shadow: 6px 6px 0 var(--color-border);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 8px 8px 0 var(--color-border);
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.name {
  font-family: var(--font-sans);
  font-size: 1.125rem;
  font-weight: 700;
  text-transform: uppercase;
}
.description {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.875rem;
  color: var(--color-foreground);
  opacity: 0.8;
  flex-grow: 1;
}
.status {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  margin-top: var(--space-2);
}
.active { color: var(--color-forest); }
.idle { color: var(--color-foreground); opacity: 0.6; }
.processing { color: var(--color-amber); display: flex; align-items: center; gap: var(--space-2); }
.spinner {
  display: inline-block;
  width: 10px;
  height: 10px;
  background-color: var(--color-amber);
  animation: spin 1.5s linear infinite;
}
@keyframes spin {
  100% { transform: rotate(360deg); }
}
''',
    r'components\agents\AgentFeed.tsx': '''"use client";

import React, { useEffect, useState } from "react";
import styles from "./AgentFeed.module.css";
import Button from "@/components/ui/Button";
import { AGENT_CAPABILITIES } from "@/lib/agents/types";

export default function AgentFeed() {
  const [feed, setFeed] = useState<any[]>([]);

  useEffect(() => {
    const evtSource = new EventSource("/api/agents/feed");
    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setFeed((prev) => [data, ...prev].slice(0, 50));
    };
    return () => evtSource.close();
  }, []);

  const clearFeed = () => setFeed([]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button variant="ghost" onClick={clearFeed}>CLEAR FEED</Button>
      </div>
      <div className={styles.list}>
        {feed.length === 0 ? (
          <div className={styles.empty}>Agents are quiet...</div>
        ) : (
          feed.map((item, i) => {
            const agent = AGENT_CAPABILITIES.find(a => a.id === item.agentId);
            const color = agent?.color || "var(--color-foreground)";
            return (
              <div key={i} className={styles.entry} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={styles.dot} style={{ backgroundColor: color }} />
                <div className={styles.time}>{new Date(item.timestamp).toLocaleTimeString()}</div>
                <div className={styles.message}>{item.message}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
''',
    r'components\agents\AgentFeed.module.css': '''.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 2px solid var(--color-border);
  background-color: var(--color-surface);
}
.header {
  padding: var(--space-2);
  border-bottom: 2px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
}
.list {
  flex-grow: 1;
  overflow-y: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.empty {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1rem;
  color: var(--color-foreground);
  opacity: 0.6;
  text-align: center;
  margin-top: var(--space-6);
}
.entry {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  animation: slideUp 0.3s ease-out forwards;
  opacity: 0;
  transform: translateY(10px);
}
@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}
.time {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  opacity: 0.7;
  white-space: nowrap;
}
.message {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  line-height: 1.4;
}
''',
    r'components\agents\AgentStatusBar.tsx': '''"use client";

import React from "react";
import styles from "./AgentStatusBar.module.css";
import { AGENT_CAPABILITIES } from "@/lib/agents/types";
import { useAgentStore } from "@/store/agent-store";

export default function AgentStatusBar() {
  const agents = useAgentStore((state: any) => state.agents || {});

  return (
    <div className={styles.bar}>
      {AGENT_CAPABILITIES.map((cap) => {
        const agent = agents[cap.id];
        const status = agent?.status || "idle";
        
        return (
          <div key={cap.id} className={styles.item}>
            <div className={styles.square} style={{ backgroundColor: cap.color }} />
            <div className={styles.name}>{cap.name.substring(0, 3).toUpperCase()}</div>
            <div className={`${styles.statusDot} ${styles[status]}`} />
          </div>
        );
      })}
    </div>
  );
}
''',
    r'components\agents\AgentStatusBar.module.css': '''.bar {
  display: flex;
  gap: var(--space-6);
  padding: var(--space-3) var(--space-6);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-surface);
  overflow-x: auto;
}
.item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.square {
  width: 10px;
  height: 10px;
}
.name {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
}
.statusDot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.idle { background-color: var(--color-border); opacity: 0.5; }
.active { background-color: var(--color-forest); }
.processing { background-color: var(--color-amber); animation: pulse 1s infinite alternate; }

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.7; }
  100% { transform: scale(1.5); opacity: 1; }
}
''',
    r'components\agents\PrepBriefing.tsx': '''"use client";

import React, { useEffect, useState } from "react";
import styles from "./PrepBriefing.module.css";
import Button from "@/components/ui/Button";

interface PrepBriefingProps {
  eventId: string;
  calendarId?: string;
}

export default function PrepBriefing({ eventId, calendarId = "primary" }: PrepBriefingProps) {
  const [briefing, setBriefing] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchBriefing = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, calendarId }),
      });
      if (res.ok) {
        const data = await res.json();
        setBriefing(data.text);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, [eventId]);

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>PREP BRIEFING</h3>
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Preparing briefing...</span>
        </div>
      ) : (
        <div className={styles.content}>
          {briefing ? (
            <div className={styles.markdown}>{briefing}</div>
          ) : (
            <div className={styles.empty}>No briefing available.</div>
          )}
        </div>
      )}
      <Button variant="outline" onClick={fetchBriefing} className={styles.regenBtn} disabled={loading}>
        REGENERATE
      </Button>
    </div>
  );
}
''',
    r'components\agents\PrepBriefing.module.css': '''.container {
  display: flex;
  flex-direction: column;
  border: 2px solid var(--color-border);
  border-left-width: 4px;
  border-left-color: var(--color-navy);
  background: var(--color-surface);
  padding: var(--space-4);
  box-shadow: 6px 6px 0 var(--color-border);
  height: 100%;
}
.heading {
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-2);
}
.loading {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-family: var(--font-serif);
  font-style: italic;
  flex-grow: 1;
}
.spinner {
  width: 14px;
  height: 14px;
  background-color: var(--color-navy);
  animation: spin 1s linear infinite;
}
@keyframes spin { 100% { transform: rotate(360deg); } }
.content {
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: var(--space-4);
}
.markdown {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  line-height: 1.6;
  white-space: pre-wrap;
}
.empty {
  font-family: var(--font-serif);
  font-style: italic;
  opacity: 0.7;
}
.regenBtn {
  width: 100%;
}
''',
    r'components\agents\OptimizerPanel.tsx': '''"use client";

import React, { useEffect, useState } from "react";
import styles from "./OptimizerPanel.module.css";

interface OptimizerPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OptimizerPanel({ isOpen, onClose }: OptimizerPanelProps) {
  const [suggestions, setSuggestions] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const timeMin = new Date().toISOString();
      const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      fetch("/api/agents/optimizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeMin, timeMax }),
      })
        .then(res => res.json())
        .then(data => setSuggestions(data.suggestions))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>CALENDAR OPTIMIZER</h2>
          <button className={styles.closeBtn} onClick={onClose}>X</button>
        </div>
        
        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
            </div>
          ) : (
            <div className={styles.results}>
              <div className={styles.markdown}>{suggestions}</div>
            </div>
          )}
        </div>
        
        <div className={styles.analytics}>
          <div className={styles.analyticsTitle}>TIME ANALYTICS (EST.)</div>
          <div className={styles.bar}>
            <div className={styles.barSegment} style={{ width: '40%', backgroundColor: 'var(--color-navy)' }}></div>
            <div className={styles.barSegment} style={{ width: '30%', backgroundColor: 'var(--color-forest)' }}></div>
            <div className={styles.barSegment} style={{ width: '30%', backgroundColor: 'var(--color-terracotta)' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
''',
    r'components\agents\OptimizerPanel.module.css': '''.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
}
.panel {
  width: 360px;
  height: 100%;
  background: var(--color-surface);
  border-left: 4px solid var(--color-terracotta);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s forwards;
}
@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
.header {
  padding: var(--space-4);
  border-bottom: 2px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  font-family: var(--font-mono);
  font-size: 1.125rem;
  font-weight: 700;
}
.closeBtn {
  background: none;
  border: none;
  font-family: var(--font-mono);
  font-size: 1.25rem;
  cursor: pointer;
}
.content {
  flex-grow: 1;
  overflow-y: auto;
  padding: var(--space-4);
}
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.spinner {
  width: 24px;
  height: 24px;
  background-color: var(--color-terracotta);
  animation: spin 1s linear infinite;
}
.markdown {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
}
.analytics {
  padding: var(--space-4);
  border-top: 2px solid var(--color-border);
}
.analyticsTitle {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: var(--space-2);
}
.bar {
  display: flex;
  height: 24px;
  border: 1px solid var(--color-border);
}
.barSegment {
  height: 100%;
}
''',
    r'components\agents\AgentChat.tsx': '''"use client";

import React, { useState } from "react";
import styles from "./AgentChat.module.css";
import Button from "@/components/ui/Button";

interface AgentChatProps {
  agentId: string;
  agentName: string;
  agentColor: string;
  onClose: () => void;
}

export default function AgentChat({ agentId, agentName, agentColor, onClose }: AgentChatProps) {
  const [messages, setMessages] = useState<{role: 'user'|'agent', text: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, message: msg }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'agent', text: data.response }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ borderLeftColor: agentColor }}>
        <h2 className={styles.title}>{agentName}</h2>
        <button className={styles.closeBtn} onClick={onClose}>X</button>
      </div>
      
      <div className={styles.history}>
        {messages.map((m, i) => (
          <div key={i} className={`${styles.message} ${m.role === 'user' ? styles.user : styles.agent}`}>
            {m.role === 'agent' && <div className={styles.agentBar} style={{ backgroundColor: agentColor }} />}
            <div className={styles.text}>{m.text}</div>
          </div>
        ))}
        {loading && <div className={styles.typing}>Agent is typing...</div>}
      </div>

      <div className={styles.inputArea}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className={styles.input}
          placeholder="Ask something..."
        />
        <Button variant="primary" onClick={handleSend} disabled={loading}>SEND</Button>
      </div>
    </div>
  );
}
''',
    r'components\agents\AgentChat.module.css': '''.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: 6px 6px 0 var(--color-border);
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  border-bottom: 2px solid var(--color-border);
  border-left-width: 4px;
  border-left-style: solid;
}
.title {
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
}
.closeBtn {
  background: none;
  border: none;
  font-family: var(--font-mono);
  cursor: pointer;
}
.history {
  flex-grow: 1;
  overflow-y: auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.message {
  display: flex;
  max-width: 85%;
  position: relative;
}
.user {
  align-self: flex-end;
  background-color: var(--color-foreground);
  color: var(--color-surface);
  padding: var(--space-3);
  border-radius: 0;
}
.agent {
  align-self: flex-start;
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  padding: var(--space-3);
}
.agentBar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}
.agent .text {
  padding-left: var(--space-2);
}
.text {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
}
.typing {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 0.875rem;
  color: var(--color-foreground);
  opacity: 0.6;
}
.inputArea {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-4);
  border-top: 2px solid var(--color-border);
}
.input {
  flex-grow: 1;
  border: 2px solid var(--color-border);
  padding: var(--space-2);
  font-family: var(--font-sans);
  font-size: 1rem;
  outline: none;
}
.input:focus {
  border-color: var(--color-navy);
}
''',
    r'components\agents\SearchCommand.tsx': '''"use client";

import React, { useEffect, useState } from "react";
import styles from "./SearchCommand.module.css";
import { useRouter } from "next/navigation";

interface SearchCommandProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchCommand({ isOpen, onClose }: SearchCommandProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{events: any[], files: any[], summary: string}>({events: [], files: [], summary: ""});
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    
    const timeout = setTimeout(async () => {
      if (query.trim()) {
        try {
          const res = await fetch("/api/agents/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
          });
          if (res.ok) {
            const data = await res.json();
            setResults(data);
          }
        } catch(e) {}
      } else {
        setResults({events: [], files: [], summary: ""});
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <input 
          autoFocus
          className={styles.input}
          placeholder="Search everywhere (Cmd+K)..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <div className={styles.resultsArea}>
            {results.summary && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>AI SUMMARY</div>
                <div className={styles.summary}>{results.summary}</div>
              </div>
            )}
            
            {results.events.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>EVENTS</div>
                {results.events.map((e, i) => (
                  <div key={i} className={styles.item} onClick={() => { router.push(`/calendar/${e.id}`); onClose(); }}>
                    {e.summary}
                  </div>
                ))}
              </div>
            )}
            
            {results.files.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>DOCUMENTS</div>
                {results.files.map((f, i) => (
                  <div key={i} className={styles.item} onClick={() => { router.push(`/documents/${f.id}`); onClose(); }}>
                    {f.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
''',
    r'components\agents\SearchCommand.module.css': '''.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 200;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 15vh;
}
.modal {
  width: 100%;
  max-width: 640px;
  background: var(--color-surface);
  border: 3px solid var(--color-border);
  box-shadow: 12px 12px 0 var(--color-border);
  display: flex;
  flex-direction: column;
}
.input {
  padding: var(--space-6);
  font-size: 1.5rem;
  font-family: var(--font-serif);
  border: none;
  border-bottom: 3px solid var(--color-border);
  outline: none;
  background: transparent;
}
.resultsArea {
  max-height: 50vh;
  overflow-y: auto;
  padding: var(--space-4);
}
.section {
  margin-bottom: var(--space-6);
}
.sectionTitle {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 700;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--space-2);
  margin-bottom: var(--space-2);
  color: var(--color-navy);
}
.summary {
  font-family: var(--font-sans);
  font-size: 1rem;
  line-height: 1.5;
}
.item {
  padding: var(--space-2);
  font-family: var(--font-sans);
  font-size: 1rem;
  cursor: pointer;
  border-left: 2px solid transparent;
}
.item:hover {
  background: var(--color-background);
  border-left-color: var(--color-navy);
}
''',
    r'app\agents\page.tsx': '''"use client";

import React, { useState, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import AgentStatusBar from "@/components/agents/AgentStatusBar";
import AgentCard from "@/components/agents/AgentCard";
import AgentFeed from "@/components/agents/AgentFeed";
import AgentChat from "@/components/agents/AgentChat";
import OptimizerPanel from "@/components/agents/OptimizerPanel";
import SearchCommand from "@/components/agents/SearchCommand";
import { AGENT_CAPABILITIES } from "@/lib/agents/types";

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [optimizerOpen, setOptimizerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggle = (id: string, active: boolean) => {
    console.log("Toggle", id, active);
  };

  const activeAgentInfo = selectedAgent ? AGENT_CAPABILITIES.find(a => a.id === selectedAgent) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar title="AGENT COMMAND CENTER" />
      <AgentStatusBar />
      
      <div style={{ display: 'flex', flexGrow: 1, padding: 'var(--space-6)', gap: 'var(--space-6)', overflow: 'hidden' }}>
        
        <div style={{ flex: '1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', overflowY: 'auto' }}>
          {AGENT_CAPABILITIES.map(agent => (
            <AgentCard 
              key={agent.id} 
              agent={{...agent, active: true, status: 'idle'}} 
              onToggle={handleToggle}
              onClick={setSelectedAgent}
            />
          ))}
        </div>

        <div style={{ flex: '1' }}>
          <AgentFeed />
        </div>

        <div style={{ flex: '1' }}>
          {activeAgentInfo ? (
            <AgentChat 
              agentId={activeAgentInfo.id} 
              agentName={activeAgentInfo.name}
              agentColor={activeAgentInfo.color}
              onClose={() => setSelectedAgent(null)}
            />
          ) : (
            <div style={{ border: '2px dashed var(--color-border)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontStyle: 'italic', opacity: 0.6 }}>
              Select an agent to chat
            </div>
          )}
        </div>
      </div>

      <OptimizerPanel isOpen={optimizerOpen} onClose={() => setOptimizerOpen(false)} />
      <SearchCommand isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
''',
    r'app\(dashboard)\page.tsx': '''"use client";

import React from "react";
import TopBar from "@/components/layout/TopBar";
import AgentFeed from "@/components/agents/AgentFeed";
import AgentStatusBar from "@/components/agents/AgentStatusBar";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function DashboardPage() {
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar title="DASHBOARD" />
      
      <div style={{ display: 'flex', flexGrow: 1, padding: 'var(--space-6)', gap: 'var(--space-6)' }}>
        
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', borderBottom: '2px solid', paddingBottom: '8px', marginBottom: '16px' }}>CALENDAR</h2>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, marginBottom: '24px' }}>{date}</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ border: '2px solid', padding: '16px', boxShadow: '4px 4px 0 #000' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', marginBottom: '8px' }}>10:00 AM</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.25rem' }}>Design Review</div>
              </div>
            </div>
            
            <Link href="/calendar" style={{ display: 'inline-block', marginTop: '24px', fontFamily: 'var(--font-mono)', fontWeight: 700, textDecoration: 'none', color: 'var(--color-navy)' }}>
              View Full Calendar &rarr;
            </Link>
          </div>
        </div>

        <div style={{ flex: '1.5', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', borderBottom: '2px solid', paddingBottom: '8px', marginBottom: '16px' }}>AGENT FEED</h2>
          <AgentFeed />
        </div>

        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', borderBottom: '2px solid', paddingBottom: '8px', marginBottom: '16px' }}>STATUS</h2>
            <AgentStatusBar />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
            <Button variant="primary" style={{ width: '100%' }}>NEW EVENT</Button>
            <Button variant="outline" style={{ width: '100%' }}>UPLOAD FILE</Button>
            <Button variant="outline" style={{ width: '100%', borderColor: 'var(--color-terracotta)', color: 'var(--color-terracotta)' }}>OPTIMIZE SCHEDULE</Button>
          </div>
        </div>

      </div>
    </div>
  );
}
'''
}

for path, content in files.items():
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)

print('Success')
