'use client'

import React, { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import { ViewToggle, ViewType } from '@/components/calendar/ViewToggle'
import { MonthView } from '@/components/calendar/MonthView'
import { WeekView } from '@/components/calendar/WeekView'
import { AgendaView } from '@/components/calendar/AgendaView'
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

  // null = follow the Settings default; a value = user changed it this session
  const [viewOverride, setViewOverride] = useState<ViewType | null>(null)
  const activeView: ViewType = viewOverride ?? defaultCalendarView
  const setActiveView = (v: ViewType) => setViewOverride(v)

  // Deep link support: /calendar?new=1 opens the New Event modal
  const openedViaLink = searchParams.get('new') === '1'
  const [isEventModalOpen, setEventModalOpen] = useState(openedViaLink)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [modalDate, setModalDate] = useState<Date | null>(openedViaLink ? new Date() : null)

  // Multi-calendar state
  const [calendars, setCalendars] = useState<CalendarInfo[]>([])
  const [activeCalendarIds, setActiveCalendarIds] = useState<string[]>(['primary'])

  // Clean the deep-link param from the URL after consuming it
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      router.replace('/calendar')
    }
  }, [searchParams, router])

  // When calendars are loaded, activate all of them and fetch events
  const handleCalendarsLoaded = useCallback((cals: CalendarInfo[]) => {
    setCalendars(cals)
    const allIds = cals.map(c => c.id)
    setActiveCalendarIds(allIds)
  }, [])

  // Fetch events from all active calendars
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
          // Tag each event with its calendar source for color coding
          const tagged = items.map((e: CalendarEvent) => ({
            ...e,
            colorId: e.colorId || calendars.find(c => c.id === calId)?.backgroundColor,
          }))
          allEvents.push(...tagged)
        }
      }
      // Deduplicate by event id
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

  const handleEventClick = (event: CalendarEvent) => {
    router.push(`/calendar/${event.id}`)
  }

  const handleDateClick = (date: Date) => {
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

  const handleSave = async (eventData: Partial<CalendarEvent> & { calendarId?: string }) => {
    try {
      const { calendarId = 'primary', ...rest } = eventData
      const res = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarId, ...rest })
      })
      if (res.ok) {
        const newEvent = await res.json()
        setEvents(prev => [...prev, newEvent])
        setEventModalOpen(false)

        // Show Meet link if one was created
        if (newEvent.hangoutLink) {
          // Brief delay so the modal closes first
          setTimeout(() => {
            alert(`✅ Event created!\n\nGoogle Meet link:\n${newEvent.hangoutLink}`)
          }, 300)
        }
      }
    } catch (err) {
      console.error(err)
    }
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
                setModalDate(d)
                setEventModalOpen(true)
              }}
            />
          )}
          {activeView === 'agenda' && (
            <AgendaView
              events={events}
              onEventClick={handleEventClick}
            />
          )}
        </main>
      </div>

      <button
        className="fixed bottom-8 right-8 btn shadow-card"
        onClick={() => { setModalDate(new Date()); setEventModalOpen(true) }}
      >
        NEW EVENT
      </button>

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setEventModalOpen(false)}
        event={null}
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
