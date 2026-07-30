'use client'

import React from 'react'
import type { CalendarEvent } from '@/lib/store/calendar-store'
import styles from './EventDetail.module.css'
import AttachedDocuments from '@/components/calendar/AttachedDocuments'

interface EventDetailProps {
  event: CalendarEvent
}

export function EventDetail({ event }: EventDetailProps) {
  const startStr = event.start?.dateTime || event.start?.date
  const endStr = event.end?.dateTime || event.end?.date
  
  const formattedDate = startStr ? new Date(startStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''
  const formattedTime = startStr && event.start?.dateTime ? `${new Date(startStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endStr ? new Date(endStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}` : 'All Day'

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className="serif">{event.summary || '(No title)'}</h1>
        <div className="mono text-secondary mt-2">
          {formattedDate} • {formattedTime}
        </div>
      </div>

      <div className={styles.content}>
        {event.location && (
          <div className={styles.section}>
            <div className="mono uppercase text-xs font-bold mb-1">Location</div>
            <div>📍 {event.location}</div>
          </div>
        )}

        {event.description && (
          <div className={styles.section}>
            <div className="mono uppercase text-xs font-bold mb-1">Description</div>
            <div className={styles.description}>{event.description}</div>
          </div>
        )}

        {event.attendees && event.attendees.length > 0 && (
          <div className={styles.section}>
            <div className="mono uppercase text-xs font-bold mb-2">Attendees ({event.attendees.length})</div>
            <ul className={styles.attendees}>
              {event.attendees.map((attendee, i) => (
                <li key={i} className={styles.attendee}>
                  {attendee.email} {attendee.responseStatus === 'accepted' ? '✅' : attendee.responseStatus === 'declined' ? '❌' : '⏳'}
                </li>
              ))}
            </ul>
          </div>
        )}

        <AttachedDocuments eventId={event.id} />
      </div>

      <div className={styles.actions}>
        <button className="btn btn--outline">Edit</button>
        <button className="btn" style={{ backgroundColor: 'var(--color-burgundy)' }}>Delete</button>
      </div>
    </div>
  )
}
