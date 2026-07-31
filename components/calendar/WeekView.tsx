/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useRef, useEffect, useState } from 'react'
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
  onEventDrop?: (eventId: string, newDate: Date, newHour: number) => void
}

export function WeekView({ currentDate, events, onEventClick, onTimeSlotClick, onEventDrop }: WeekViewProps) {
  const weekStartsOn = useSettingsStore((s) => s.weekStartsOn)
  const dayStartHour = useSettingsStore((s) => s.dayStartHour)
  const timeFormat = useSettingsStore((s) => s.timeFormat)
  const dates = getWeekDates(currentDate, weekStartsOn)
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)

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

  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropTarget(key)
  }

  const handleDragLeave = () => {
    setDropTarget(null)
  }

  const handleDrop = (e: React.DragEvent, date: Date, hour: number) => {
    e.preventDefault()
    setDropTarget(null)
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'))
      if (data.eventId && onEventDrop) {
        onEventDrop(data.eventId, date, hour)
      }
    } catch {
      // ignore invalid drag data
    }
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
                const cellKey = `${dayIndex}-${hour}`
                const cellEvents = events.filter(e => {
                  if (!e.start?.dateTime) return false
                  const eDate = new Date(e.start.dateTime)
                  return isSameDay(eDate, date) && eDate.getHours() === hour
                })
                const isDropTarget = dropTarget === cellKey

                return (
                  <div 
                    key={cellKey} 
                    className={`${styles.cell} ${isDropTarget ? styles.dropTarget : ''}`}
                    onClick={() => onTimeSlotClick(date, hour)}
                    onDragOver={(e) => handleDragOver(e, cellKey)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, date, hour)}
                  >
                    {cellEvents.map(event => (
                      <div key={event.id} className={styles.eventWrapper} onClick={(e) => { e.stopPropagation(); onEventClick(event); }}>
                        <EventCard event={event} variant="block" draggable />
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
