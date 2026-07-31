'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import { ViewToggle, ViewType } from '@/components/calendar/ViewToggle'
import { MonthView } from '@/components/calendar/MonthView'
import { WeekView } from '@/components/calendar/WeekView'
import { AgendaView } from '@/components/calendar/AgendaView'
import { EventModal } from '@/components/calendar/EventModal'
import { useSettingsStore } from '@/lib/store/settings-store'
import type { CalendarEvent } from '@/lib/store/calendar-store'

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

  // Clean the deep-link param from the URL after consuming it
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      router.replace('/calendar')
    }
  }, [searchParams, router])

  useEffect(() => {
    fetch('/api/calendar/events')
      .then(res => res.json())
      .then(data => {
        if (data.items) setEvents(data.items)
      })
      .catch(err => console.error(err))
  }, [])

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

  const handleSave = async (eventData: Partial<CalendarEvent>) => {
    try {
      const res = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      })
      if (res.ok) {
        const newEvent = await res.json()
        setEvents([...events, newEvent])
        setEventModalOpen(false)
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-app">
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

      <main className="flex-1 overflow-auto p-4">
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
