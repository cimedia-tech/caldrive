'use client'

import React, { useState } from 'react'
import { getMonthDates, getDayHeaders, isToday, isSameDay } from '@/lib/utils/date'
import { useSettingsStore } from '@/lib/store/settings-store'
import type { CalendarEvent } from '@/lib/store/calendar-store'
import styles from './MonthView.module.css'
import { EventCard } from './EventCard'

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onDateClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
  onEventDrop?: (eventId: string, newDate: Date) => void
}

export function MonthView({ currentDate, events, onDateClick, onEventClick, onEventDrop }: MonthViewProps) {
  const weekStartsOn = useSettingsStore((s) => s.weekStartsOn)
  const dates = getMonthDates(currentDate.getFullYear(), currentDate.getMonth(), weekStartsOn).flat()
  const daysOfWeek = getDayHeaders(weekStartsOn)
  const monthName = currentDate.toLocaleString('default', { month: 'long' })
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault()
    setDragOverIndex(null)
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'))
      if (data.eventId && onEventDrop) {
        onEventDrop(data.eventId, targetDate)
      }
    } catch {
      // ignore invalid drag data
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className="serif uppercase">{monthName} {currentDate.getFullYear()}</h2>
      </header>
      
      <div className={styles.grid}>
        {daysOfWeek.map(day => (
          <div key={day} className={`${styles.dayHeader} mono uppercase`}>
            {day}
          </div>
        ))}
        
        {dates.map((date, i) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth()
          const today = isToday(date)
          const dayEvents = events.filter(e => e.start && isSameDay(new Date(e.start.dateTime || e.start.date || ''), date))
          const visibleEvents = dayEvents.slice(0, 3)
          const moreCount = dayEvents.length - 3
          const isDragTarget = dragOverIndex === i
          
          return (
            <div 
              key={i} 
              className={`${styles.cell} ${!isCurrentMonth ? styles.outside : ''} ${today ? styles.today : ''} ${isDragTarget ? styles.dropTarget : ''}`}
              onClick={() => onDateClick(date)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, date)}
            >
              <div className={`${styles.dateNumber} mono ${isCurrentMonth ? styles.bold : ''}`}>
                {date.getDate()}
              </div>
              
              <div className={styles.eventList}>
                {visibleEvents.map(event => (
                  <div key={event.id} onClick={(e) => { e.stopPropagation(); onEventClick(event); }}>
                    <EventCard event={event} variant="pill" draggable />
                  </div>
                ))}
                {moreCount > 0 && (
                  <div className={`${styles.more} mono`}>+{moreCount} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
