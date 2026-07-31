'use client'

import React, { useEffect, useState } from 'react'
import styles from './CalendarSidebar.module.css'

interface CalendarEntry {
  id: string
  summary: string
  backgroundColor?: string
  primary?: boolean
}

interface CalendarSidebarProps {
  activeCalendarIds: string[]
  onToggle: (id: string) => void
  onCalendarsLoaded?: (calendars: CalendarEntry[]) => void
}

export function CalendarSidebar({ activeCalendarIds, onToggle, onCalendarsLoaded }: CalendarSidebarProps) {
  const [calendars, setCalendars] = useState<CalendarEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/calendar/calendars')
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated')
        return res.json()
      })
      .then((data: CalendarEntry[]) => {
        if (Array.isArray(data)) {
          setCalendars(data)
          onCalendarsLoaded?.(data)
        }
      })
      .catch(() => {
        setCalendars([])
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <aside className={styles.sidebar}>
        <h3 className={styles.heading}>My Calendars</h3>
        <div className={styles.loading}>Loading calendars…</div>
      </aside>
    )
  }

  if (calendars.length === 0) {
    return (
      <aside className={styles.sidebar}>
        <h3 className={styles.heading}>My Calendars</h3>
        <div className={styles.empty}>Sign in to see your calendars</div>
      </aside>
    )
  }

  return (
    <aside className={styles.sidebar}>
      <h3 className={styles.heading}>My Calendars</h3>
      <div className={styles.list}>
        {calendars.map(cal => {
          const isActive = activeCalendarIds.includes(cal.id)
          const color = cal.backgroundColor || '#4285f4'
          return (
            <button
              key={cal.id}
              className={styles.calendarItem}
              onClick={() => onToggle(cal.id)}
              title={cal.summary}
            >
              <div
                className={`${styles.checkbox} ${isActive ? styles.checked : ''}`}
                style={isActive ? { backgroundColor: color } : undefined}
              >
                {isActive && <span className={styles.checkmark}>✓</span>}
              </div>
              <span className={`${styles.calendarName} ${cal.primary ? styles.primary : ''}`}>
                {cal.summary}
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
