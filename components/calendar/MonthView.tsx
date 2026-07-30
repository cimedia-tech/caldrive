'use client'

import React from 'react'
import { getMonthDates, isToday, isSameDay } from '@/lib/utils/date'
import type { CalendarEvent } from '@/lib/store/calendar-store'
import styles from './MonthView.module.css'
import { EventCard } from './EventCard'

interface MonthViewProps {
  currentDate: Date
  events: CalendarEvent[]
  onDateClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}

export function MonthView({ currentDate, events, onDateClick, onEventClick }: MonthViewProps) {
  const dates = getMonthDates(currentDate.getFullYear(), currentDate.getMonth()).flat()
  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  const monthName = currentDate.toLocaleString('default', { month: 'long' })
  
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
          
          return (
            <div 
              key={i} 
              className={`${styles.cell} ${!isCurrentMonth ? styles.outside : ''} ${today ? styles.today : ''}`}
              onClick={() => onDateClick(date)}
            >
              <div className={`${styles.dateNumber} mono ${isCurrentMonth ? styles.bold : ''}`}>
                {date.getDate()}
              </div>
              
              <div className={styles.eventList}>
                {visibleEvents.map(event => (
                  <div key={event.id} onClick={(e) => { e.stopPropagation(); onEventClick(event); }}>
                    <EventCard event={event} variant="pill" />
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
