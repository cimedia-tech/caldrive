'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
// import TopBar from '@/components/layout/TopBar' // Assuming this exists
import { ViewToggle, ViewType } from '@/components/calendar/ViewToggle'
import { MonthView } from '@/components/calendar/MonthView'
import { WeekView } from '@/components/calendar/WeekView'
import { AgendaView } from '@/components/calendar/AgendaView'
import { EventModal } from '@/components/calendar/EventModal'
import type { CalendarEvent } from '@/lib/store/calendar-store'

export default function CalendarPage() {
  const router = useRouter()
  // Mocking the store for now, adapt as needed based on actual implementation
  // const { activeView, setView, isEventModalOpen, setEventModalOpen, events, fetchEvents } = useCalendarStore()
  
  const [activeView, setActiveView] = useState<ViewType>('month')
  const [isEventModalOpen, setEventModalOpen] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    // Fetch events from API
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
    // maybe set current date, switch to day/week view, or open new event
    setCurrentDate(date)
    setEventModalOpen(true)
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
    <div className="flex flex-col h-screen bg-[#fafafa]">
      {/* <TopBar /> */}
      <div className="p-4 border-b-2 border-black flex justify-between items-center bg-white">
        <h1 className="serif text-2xl">Calendar Engine</h1>
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
            onTimeSlotClick={(date) => { setCurrentDate(date); setEventModalOpen(true) }}
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
        className="fixed bottom-8 right-8 btn shadow-[6px_6px_0_#000] hover:shadow-[8px_8px_0_#000]"
        onClick={() => setEventModalOpen(true)}
      >
        NEW EVENT
      </button>

      <EventModal 
        isOpen={isEventModalOpen} 
        onClose={() => setEventModalOpen(false)} 
        event={null}
        onSave={handleSave}
      />
    </div>
  )
}
