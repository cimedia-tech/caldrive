'use client'

import React from 'react'
import type { CalendarEvent } from '@/lib/store/calendar-store'
import styles from './TableView.module.css'

interface CalendarInfo {
  id: string
  summary: string
  backgroundColor?: string
  primary?: boolean
}

interface TableViewProps {
  events: CalendarEvent[]
  calendars: CalendarInfo[]
  onEventClick: (event: CalendarEvent) => void
}

export function TableView({ events, calendars, onEventClick }: TableViewProps) {
  // Sort events by start date
  const sorted = [...events].sort((a, b) => {
    const aDate = a.start?.dateTime || a.start?.date || ''
    const bDate = b.start?.dateTime || b.start?.date || ''
    return new Date(aDate).getTime() - new Date(bDate).getTime()
  })

  const formatDate = (event: CalendarEvent): string => {
    const d = event.start?.dateTime || event.start?.date
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (event: CalendarEvent): string => {
    const start = event.start?.dateTime
    const end = event.end?.dateTime
    if (!start) return 'All Day'
    const s = new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const e = end ? new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
    return e ? `${s} – ${e}` : s
  }

  const getCalendarInfo = (event: CalendarEvent): CalendarInfo | undefined => {
    // Try to match by colorId (hex) or find primary
    if (event.colorId?.startsWith('#')) {
      return calendars.find(c => c.backgroundColor === event.colorId)
    }
    return calendars.find(c => c.primary) || calendars[0]
  }

  const getMeetLink = (event: CalendarEvent): string | null => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ev = event as any
    return ev.hangoutLink || ev.conferenceData?.entryPoints?.[0]?.uri || null
  }

  if (sorted.length === 0) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className="serif uppercase">All Events</h2>
        </header>
        <div className={styles.empty}>No events found for selected calendars</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className="serif uppercase">All Events</h2>
        <span className={`${styles.count} mono`}>{sorted.length} event{sorted.length !== 1 ? 's' : ''}</span>
      </header>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Time</th>
              <th>Calendar</th>
              <th>Location</th>
              <th>Meet</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(event => {
              const cal = getCalendarInfo(event)
              const meetLink = getMeetLink(event)
              return (
                <tr key={event.id} onClick={() => onEventClick(event)}>
                  <td className={styles.titleCol}>{event.summary || '(No title)'}</td>
                  <td className={styles.dateCol}>{formatDate(event)}</td>
                  <td className={styles.timeCol}>{formatTime(event)}</td>
                  <td>
                    <div className={styles.calendarCell}>
                      <span
                        className={styles.calendarDot}
                        style={{ backgroundColor: cal?.backgroundColor || '#5484ed' }}
                      />
                      {cal?.summary || 'Primary'}
                    </div>
                  </td>
                  <td className={styles.locationCol} title={event.location || ''}>
                    {event.location || '—'}
                  </td>
                  <td>
                    {meetLink ? (
                      <a
                        href={meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.meetLink}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Join Meet ↗
                      </a>
                    ) : (
                      <span className={styles.noMeet}>—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
