'use client'

import React, { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import { ViewToggle, ViewType } from '@/components/calendar/ViewToggle'
import { MonthView } from '@/components/calendar/MonthView'
import { WeekView } from '@/components/calendar/WeekView'
import { AgendaView } from '@/components/calendar/AgendaView'
import { TableView } from '@/components/calendar/TableView'
import { EventModal } from '@/components/calendar/EventModal'
import { CalendarSidebar } from '@/components/calendar/CalendarSidebar'
import { useSettingsStore } from '@/lib/store/settings-store'
import type { CalendarEvent } from '@/lib/store/calendar-store'

interface CalendarInfo {
  id: string
  summary: string
  backgroundColor?: string
  primary?: boolean
}

function addMonths(date: Date, delta: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + delta)
  return d
}

function addDaysTo(date: Date, delta: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + delta)
  return d
}

function CalendarPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultCalendarView = useSettingsStore((s) => s.defaultCalendarView)
  const defaultEventDurationMin = useSettingsStore((s) => s.defaultEventDurationMin)

  const [viewOverride, setViewOverride] = useState<ViewType | null>(null)
  const activeView: ViewType = viewOverride ?? defaultCalendarView
  const setActiveView = (v: ViewType) => setViewOverride(v)

  const openedViaLink = searchParams.get('new') === '1'
  const [isEventModalOpen, setEventModalOpen] = useState(openedViaLink)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [modalDate, setModalDate] = useState<Date | null>(openedViaLink ? new Date() : null)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)

  // Multi-calendar state
  const [calendars, setCalendars] = useState<CalendarInfo[]>([])
  const [activeCalendarIds, setActiveCalendarIds] = useState<string[]>(['primary'])

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      router.replace('/calendar')
    }
  }, [searchParams, router])

  const handleCalendarsLoaded = useCallback((cals: CalendarInfo[]) => {
    setCalendars(cals)
    setActiveCalendarIds(cals.map(c => c.id))
  }, [])

  const fetchAllEvents = useCallback(async () => {
    if (activeCalendarIds.length === 0) {
      setEvents([])
      return
    }
    try {
      const allEvents: CalendarEvent[] = []
      for (const calId of activeCalendarIds) {
        const res = await fetch(`/api/calendar/events?calendarId=${encodeURIComponent(calId)}`)
        if (res.ok) {
          const data = await res.json()
          const items = Array.isArray(data) ? data : (data.items || [])
          const tagged = items.map((e: CalendarEvent) => ({
            ...e,
            colorId: e.colorId || calendars.find(c => c.id === calId)?.backgroundColor,
          }))
          allEvents.push(...tagged)
        }
      }
      const unique = Array.from(new Map(allEvents.map(e => [e.id, e])).values())
      setEvents(unique)
    } catch (err) {
      console.error('Error fetching events:', err)
    }
  }, [activeCalendarIds, calendars])

  useEffect(() => {
    fetchAllEvents()
  }, [fetchAllEvents])

  const handleToggleCalendar = (id: string) => {
    setActiveCalendarIds(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    )
  }

  // Click event → open edit modal
  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event)
    setModalDate(null)
    setEventModalOpen(true)
  }

  const handleDateClick = (date: Date) => {
    setEditingEvent(null)
    setModalDate(date)
    setEventModalOpen(true)
  }

  const handleNavigate = (delta: number) => {
    if (delta === 0) {
      setCurrentDate(new Date())
    } else if (activeView === 'week') {
      setCurrentDate(addDaysTo(currentDate, delta * 7))
    } else {
      setCurrentDate(addMonths(currentDate, delta))
    }
  }

  // Create new event
  const handleSave = async (eventData: Partial<CalendarEvent> & { calendarId?: string }) => {
    try {
      const { calendarId = 'primary', ...rest } = eventData

      if (editingEvent) {
        // PATCH existing event
        const res = await fetch(`/api/calendar/events/${editingEvent.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ calendarId, ...rest })
        })
        if (res.ok) {
          const updated = await res.json()
          setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))
          setEventModalOpen(false)
          setEditingEvent(null)
        }
      } else {
        // POST new event
        const res = await fetch('/api/calendar/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ calendarId, ...rest })
        })
        if (res.ok) {
          const newEvent = await res.json()
          setEvents(prev => [...prev, newEvent])
          setEventModalOpen(false)

          if (newEvent.hangoutLink) {
            setTimeout(() => {
              alert(`✅ Event created!\n\nGoogle Meet link:\n${newEvent.hangoutLink}`)
            }, 300)
          }
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Drag-and-drop: move event to a new date (MonthView)
  const handleEventDropMonth = async (eventId: string, newDate: Date) => {
    const event = events.find(e => e.id === eventId)
    if (!event) return

    const oldStart = new Date(event.start?.dateTime || event.start?.date || '')
    const oldEnd = new Date(event.end?.dateTime || event.end?.date || '')
    const duration = oldEnd.getTime() - oldStart.getTime()

    // Preserve the original time, just change the date
    const newStart = new Date(newDate)
    newStart.setHours(oldStart.getHours(), oldStart.getMinutes(), 0, 0)
    const newEnd = new Date(newStart.getTime() + duration)

    try {
      const res = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: { dateTime: newStart.toISOString() },
          end: { dateTime: newEnd.toISOString() },
        })
      })
      if (res.ok) {
        const updated = await res.json()
        setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))
      }
    } catch (err) {
      console.error('Failed to move event:', err)
    }
  }

  // Drag-and-drop: move event to a new date+hour (WeekView)
  const handleEventDropWeek = async (eventId: string, newDate: Date, newHour: number) => {
    const event = events.find(e => e.id === eventId)
    if (!event) return

    const oldStart = new Date(event.start?.dateTime || event.start?.date || '')
    const oldEnd = new Date(event.end?.dateTime || event.end?.date || '')
    const duration = oldEnd.getTime() - oldStart.getTime()

    const newStart = new Date(newDate)
    newStart.setHours(newHour, 0, 0, 0)
    const newEnd = new Date(newStart.getTime() + duration)

    try {
      const res = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: { dateTime: newStart.toISOString() },
          end: { dateTime: newEnd.toISOString() },
        })
      })
      if (res.ok) {
        const updated = await res.json()
        setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))
      }
    } catch (err) {
      console.error('Failed to move event:', err)
    }
  }

  const handleCloseModal = () => {
    setEventModalOpen(false)
    setEditingEvent(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar title="CALENDAR" />
      <div className="p-4 border-b-2 flex justify-between items-center bg-white">
        <div className="flex items-center gap-2">
          <h1 className="serif text-2xl">Calendar Engine</h1>
          <div className="flex gap-2" style={{ marginLeft: 16 }}>
            <button className="btn btn--outline py-1" aria-label="Previous" onClick={() => handleNavigate(-1)}>&larr;</button>
            <button className="btn btn--outline py-1" onClick={() => handleNavigate(0)}>TODAY</button>
            <button className="btn btn--outline py-1" aria-label="Next" onClick={() => handleNavigate(1)}>&rarr;</button>
          </div>
        </div>
        <ViewToggle activeView={activeView} onChange={setActiveView} />
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <CalendarSidebar
          activeCalendarIds={activeCalendarIds}
          onToggle={handleToggleCalendar}
          onCalendarsLoaded={handleCalendarsLoaded}
        />

        <main style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
          {activeView === 'month' && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onDateClick={handleDateClick}
              onEventClick={handleEventClick}
              onEventDrop={handleEventDropMonth}
            />
          )}
          {activeView === 'week' && (
            <WeekView
              currentDate={currentDate}
              events={events}
              onEventClick={handleEventClick}
              onTimeSlotClick={(date, hour) => {
                const d = new Date(date)
                d.setHours(hour, 0, 0, 0)
                setEditingEvent(null)
                setModalDate(d)
                setEventModalOpen(true)
              }}
              onEventDrop={handleEventDropWeek}
            />
          )}
          {activeView === 'agenda' && (
            <AgendaView
              events={events}
              onEventClick={handleEventClick}
            />
          )}
          {activeView === 'table' && (
            <TableView
              events={events}
              calendars={calendars}
              onEventClick={handleEventClick}
            />
          )}
        </main>
      </div>

      <button
        className="fixed bottom-8 right-8 btn shadow-card"
        onClick={() => { setEditingEvent(null); setModalDate(new Date()); setEventModalOpen(true) }}
      >
        NEW EVENT
      </button>

      <EventModal
        isOpen={isEventModalOpen}
        onClose={handleCloseModal}
        event={editingEvent}
        initialDate={modalDate}
        defaultDurationMin={defaultEventDurationMin}
        onSave={handleSave}
        calendars={calendars}
      />
    </div>
  )
}

export default function CalendarPage() {
  return (
    <Suspense>
      <CalendarPageInner />
    </Suspense>
  )
}
