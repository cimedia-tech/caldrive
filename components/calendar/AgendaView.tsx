'use client'

import React from 'react'
import type { CalendarEvent } from '@/lib/store/calendar-store'
import styles from './AgendaView.module.css'

interface AgendaViewProps {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
}

export function AgendaView({ events, onEventClick }: AgendaViewProps) {
  // Group events by date
  const grouped = events.reduce((acc, event) => {
    const dStr = event.start?.dateTime || event.start?.date
    if (!dStr) return acc
    const d = new Date(dStr)
    // Create a date key (YYYY-MM-DD)
    const key = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    if (!acc[key]) acc[key] = []
    acc[key].push(event)
    return acc
  }, {} as Record<string, CalendarEvent[]>)

  const dates = Object.keys(grouped)

  if (dates.length === 0) {
    return (
      <div className={styles.empty}>
        <p className="serif italic">No upcoming events</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {dates.map(dateStr => (
        <div key={dateStr} className={styles.dayGroup}>
          <h3 className={`${styles.dateHeading} serif`}>{dateStr}</h3>
          <div className={styles.eventList}>
            {grouped[dateStr].map(event => {
              const start = event.start?.dateTime ? new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All Day'
              const attachments = event.attachments?.length || 0
              return (
                <div key={event.id} className={styles.eventRow} onClick={() => onEventClick(event)}>
                  <div className={`${styles.time} mono`}>{start}</div>
                  <div className={styles.title}>{event.summary || '(No title)'}</div>
                  {attachments > 0 && (
                    <div className={`${styles.badge} mono`}>
                      {attachments} doc{attachments > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
