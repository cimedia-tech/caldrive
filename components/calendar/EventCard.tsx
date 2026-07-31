'use client'

import React from 'react'
import type { CalendarEvent } from '@/lib/store/calendar-store'

interface EventCardProps {
  event: CalendarEvent
  variant: 'pill' | 'block'
  onClick?: () => void
  draggable?: boolean
}

/** Determine if text should be white or black based on background luminance */
function getContrastText(hex: string): string {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  // Relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#1a1a1a' : '#ffffff'
}

export function EventCard({ event, variant, onClick, draggable = false }: EventCardProps) {
  const colorMap: Record<string, string> = {
    '1': '#a4bdfc', '2': '#7ae7bf', '3': '#dbadff', '4': '#ff887c',
    '5': '#fbd75b', '6': '#ffb878', '7': '#46d6db', '8': '#e1e1e1',
    '9': '#5484ed', '10': '#51b749', '11': '#dc2127'
  }
  
  // Support both numeric colorId and hex backgroundColor strings
  let bgColor = '#5484ed'
  if (event.colorId) {
    if (event.colorId.startsWith('#')) {
      bgColor = event.colorId
    } else {
      bgColor = colorMap[event.colorId] || '#5484ed'
    }
  }

  const textColor = getContrastText(bgColor)
  const title = event.summary || '(No title)'

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      eventId: event.id,
      summary: event.summary,
      start: event.start,
      end: event.end,
    }))
    e.dataTransfer.effectAllowed = 'move'
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
        style={{ backgroundColor: bgColor, color: textColor }}
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
      className="border cursor-pointer overflow-hidden px-1 py-1 shadow-sm hover:shadow-md transition-shadow"
      style={{ borderLeft: `4px solid ${bgColor}`, background: '#fff' }}
    >
      <div className="text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: '#1a1a1a' }}>{title}</div>
      {timeStr && <div className="text-tiny mono" style={{ color: '#666' }}>{timeStr}</div>}
    </div>
  )
}
