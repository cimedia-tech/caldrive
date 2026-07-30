/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useRef, useEffect } from 'react'
import { getWeekDates, formatDate, isToday } from '@/lib/utils/date'
import type { CalendarEvent } from '@/lib/store/calendar-store'
import styles from './WeekView.module.css'
import { EventCard } from './EventCard'

interface WeekViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onTimeSlotClick: (date: Date, hour: number) => void
}

export function WeekView({ currentDate, events, onEventClick, onTimeSlotClick }: WeekViewProps) {
  const dates = getWeekDates(currentDate)
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to 8 AM on mount
  useEffect(() => {
    if (scrollRef.current) {
      const rowHeight = 60 // Should match CSS grid row height
      scrollRef.current.scrollTop = 8 * rowHeight
    }
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.headerGrid}>
        <div className={styles.timeAxisHeader} />
        {dates.map((date, i) => {
          const today = isToday(date)
          return (
            <div key={i} className={`${styles.dayHeader} ${today ? styles.today : ''}`}>
              <div className="mono uppercase text-sm">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="serif text-xl">{date.getDate()}</div>
            </div>
          )
        })}
      </div>

      <div className={styles.scrollArea} ref={scrollRef}>
        <div className={styles.grid}>
          {hours.map(hour => (
            <React.Fragment key={hour}>
              <div className={`${styles.timeLabel} mono`}>
                {hour.toString().padStart(2, '0')}:00
              </div>
              {dates.map((date, dayIndex) => {
                const cellEvents = events.filter(e => {
                  if (!e.start?.dateTime) return false
                  const eDate = new Date(e.start.dateTime)
                  return eDate.getDate() === date.getDate() && 
                         eDate.getMonth() === date.getMonth() &&
                         eDate.getHours() === hour
                })

                return (
                  <div 
                    key={`${dayIndex}-${hour}`} 
                    className={styles.cell}
                    onClick={() => onTimeSlotClick(date, hour)}
                  >
                    {cellEvents.map(event => (
                      <div key={event.id} className={styles.eventWrapper} onClick={(e) => { e.stopPropagation(); onEventClick(event); }}>
                        <EventCard event={event} variant="block" />
                      </div>
                    ))}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
