'use client'

import React from 'react'
import type { CalendarEvent } from '@/lib/store/calendar-store'

interface EventCardProps {
  event: CalendarEvent
  variant: 'pill' | 'block'
  onClick?: () => void
  draggable?: boolean
}

export function EventCard({ event, variant, onClick, draggable = false }: EventCardProps) {
  const colorMap: Record<string, string> = {
    '1': '#a4bdfc', '2': '#7ae7bf', '3': '#dbadff', '4': '#ff887c',
    '5': '#fbd75b', '6': '#ffb878', '7': '#46d6db', '8': '#e1e1e1',
    '9': '#5484ed', '10': '#51b749', '11': '#dc2127'
  }
  
  const bgColor = event.colorId ? colorMap[event.colorId] || '#5484ed' : '#5484ed'
  const title = event.summary || '(No title)'

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      eventId: event.id,
      summary: event.summary,
      start: event.start,
      end: event.end,
    }))
    e.dataTransfer.effectAllowed = 'move'
    // Add a subtle opacity to the dragged element
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5'
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
  }

  if (variant === 'pill') {
    return (
      <div 
        onClick={onClick}
        draggable={draggable}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ backgroundColor: bgColor }}
        className="text-xs px-1 py-0.5 whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer mono"
        title={`${title} (drag to reschedule)`}
      >
        {title}
      </div>
    )
  }

  const startStr = event.start?.dateTime
  const timeStr = startStr ? new Date(startStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

  return (
    <div 
      onClick={onClick}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="bg-white border cursor-pointer overflow-hidden px-1 py-1 shadow-sm hover:shadow-md transition-shadow"
      style={{ borderLeft: `4px solid ${bgColor}` }}
    >
      <div className="text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis">{title}</div>
      {timeStr && <div className="text-tiny mono text-muted">{timeStr}</div>}
    </div>
  )
}
