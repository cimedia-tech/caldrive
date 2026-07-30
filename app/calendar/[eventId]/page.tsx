'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { EventDetail } from '@/components/calendar/EventDetail'
import type { CalendarEvent } from '@/lib/store/calendar-store'

export default function EventPage() {
  const params = useParams()
  const [event, setEvent] = useState<CalendarEvent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.eventId) {
      fetch(`/api/calendar/events/${params.eventId}`)
        .then(res => res.json())
        .then(data => {
          setEvent(data)
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    }
  }, [params.eventId])

  if (loading) {
    return <div className="p-8 mono">Loading event...</div>
  }

  if (!event) {
    return <div className="p-8 mono">Event not found.</div>
  }

  return (
    <div className="flex h-screen bg-[#fafafa]">
      <div className="flex-1 p-8 overflow-auto">
        <EventDetail event={event} />
      </div>
      <div className="w-96 border-l-2 border-black bg-white p-6">
        <h2 className="mono uppercase font-bold mb-4">PrepBriefing</h2>
        <div className="p-4 border-2 border-black border-dashed text-center bg-[#fafafa]">
          <p className="italic serif text-secondary">AI brief placeholder (Phase 5)</p>
        </div>
      </div>
    </div>
  )
}
