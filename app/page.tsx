"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import AgentFeed from "@/components/agents/AgentFeed";
import AgentStatusBar from "@/components/agents/AgentStatusBar";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { isSameDay } from "@/lib/utils/date";
import { useSettingsStore } from "@/lib/store/settings-store";
import type { CalendarEvent } from "@/lib/store/calendar-store";

export default function DashboardPage() {
  const router = useRouter();
  const timeFormat = useSettingsStore((s) => s.timeFormat);
  const [todayEvents, setTodayEvents] = useState<CalendarEvent[]>([]);
  const [loaded, setLoaded] = useState(false);

  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  useEffect(() => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
    
    fetch(`/api/calendar/events?timeMin=${encodeURIComponent(startOfDay)}&timeMax=${encodeURIComponent(endOfDay)}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data) {
          // API returns a flat array (or { items: [...] } if raw Google response)
          const items: CalendarEvent[] = Array.isArray(data) ? data : (data.items || []);
          const events = items
            .filter(e => {
              const start = e.start?.dateTime || e.start?.date;
              return start && isSameDay(new Date(start), today);
            })
            .sort((a, b) => {
              const aT = new Date(a.start?.dateTime || a.start?.date || 0).getTime();
              const bT = new Date(b.start?.dateTime || b.start?.date || 0).getTime();
              return aT - bT;
            })
            .slice(0, 4);
          setTodayEvents(events);
        }
      })
      .catch(() => { /* calendar not connected */ })
      .finally(() => setLoaded(true));
  }, []);

  const formatTime = (e: CalendarEvent) => {
    if (!e.start?.dateTime) return 'ALL DAY';
    return new Date(e.start.dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: timeFormat === '12h',
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar title="DASHBOARD" />

      <div style={{ display: 'flex', flexGrow: 1, padding: 'var(--space-6)', gap: 'var(--space-6)' }}>

        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', borderBottom: '2px solid', paddingBottom: '8px', marginBottom: '16px' }}>CALENDAR</h2>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, marginBottom: '24px' }}>{date}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {todayEvents.length > 0 ? (
                todayEvents.map(event => (
                  <Link key={event.id} href={`/calendar/${event.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ border: '2px solid', padding: '16px', boxShadow: '4px 4px 0 #000', cursor: 'pointer' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', marginBottom: '8px' }}>{formatTime(event)}</div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.25rem' }}>{event.summary}</div>
                    </div>
                  </Link>
                ))
              ) : (
                <div style={{ border: '2px dashed var(--border)', padding: '16px', fontFamily: 'var(--font-serif)', fontStyle: 'italic', opacity: 0.6 }}>
                  {loaded ? 'No events scheduled today.' : 'Loading schedule\u2026'}
                </div>
              )}
            </div>

            <Link href="/calendar" style={{ display: 'inline-block', marginTop: '24px', fontFamily: 'var(--font-mono)', fontWeight: 700, textDecoration: 'none', color: 'var(--navy)' }}>
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
            <Button variant="primary" style={{ width: '100%' }} onClick={() => router.push('/calendar?new=1')}>NEW EVENT</Button>
            <Button variant="outline" style={{ width: '100%' }} onClick={() => router.push('/documents?upload=1')}>UPLOAD FILE</Button>
            <Button variant="outline" style={{ width: '100%', borderColor: 'var(--terracotta)', color: 'var(--terracotta)' }} onClick={() => router.push('/agents?optimize=1')}>OPTIMIZE SCHEDULE</Button>
          </div>
        </div>

      </div>
    </div>
  );
}
