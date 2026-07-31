/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useRef, useEffect } from 'react'
import { getWeekDates, formatDate, isToday, isSameDay } from '@/lib/utils/date'
import { useSettingsStore } from '@/lib/store/settings-store'
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
  const weekStartsOn = useSettingsStore((s) => s.weekStartsOn)
  const dayStartHour = useSettingsStore((s) => s.dayStartHour)
  const timeFormat = useSettingsStore((s) => s.timeFormat)
  const dates = getWeekDates(currentDate, weekStartsOn)
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to the configured day-start hour on mount
  useEffect(() => {
    if (scrollRef.current) {
      const rowHeight = 60 // Should match CSS grid row height
      scrollRef.current.scrollTop = dayStartHour * rowHeight
    }
  }, [dayStartHour])

  const formatHour = (hour: number) => {
    if (timeFormat === '24h') return `${hour.toString().padStart(2, '0')}:00`
    const h = hour % 12 === 0 ? 12 : hour % 12
    return `${h} ${hour < 12 ? 'AM' : 'PM'}`
  }

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
                {formatHour(hour)}
              </div>
              {dates.map((date, dayIndex) => {
                const cellEvents = events.filter(e => {
                  if (!e.start?.dateTime) return false
                  const eDate = new Date(e.start.dateTime)
                  return isSameDay(eDate, date) && eDate.getHours() === hour
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
