/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import React, { useState, useEffect } from 'react'
import type { CalendarEvent } from '@/lib/store/calendar-store'
import styles from './EventModal.module.css'
import Modal from '@/components/ui/Modal'

interface CalendarOption {
  id: string
  summary: string
  backgroundColor?: string
  primary?: boolean
}

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  event: CalendarEvent | null
  onSave: (eventData: Partial<CalendarEvent> & { calendarId?: string }) => void
  /** Date pre-filled when the modal opens from a calendar cell click */
  initialDate?: Date | null
  /** Default event length in minutes (from Settings) */
  defaultDurationMin?: number
  /** Available calendars for the selector */
  calendars?: CalendarOption[]
}

function toDateInputValue(d: Date): string {
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

function toTimeInputValue(d: Date): string {
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function generateRequestId(): string {
  return `meet-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function EventModal({ isOpen, onClose, event, onSave, initialDate, defaultDurationMin = 60, calendars = [] }: EventModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [calendarId, setCalendarId] = useState('primary')
  const [addMeet, setAddMeet] = useState(true)

  useEffect(() => {
    if (event) {
      setTitle(event.summary || '')
      setDescription(event.description || '')
      setLocation(event.location || '')
      const start = event.start?.dateTime ? new Date(event.start.dateTime) : new Date()
      const end = event.end?.dateTime ? new Date(event.end.dateTime) : new Date(start.getTime() + defaultDurationMin * 60000)
      setDate(toDateInputValue(start))
      setStartTime(toTimeInputValue(start))
      setEndTime(toTimeInputValue(end))
      setAddMeet(true)
    } else {
      const base = initialDate ? new Date(initialDate) : new Date()
      // Round up to the next half hour for a sensible default start
      base.setMinutes(base.getMinutes() < 30 ? 30 : 60, 0, 0)
      const end = new Date(base.getTime() + defaultDurationMin * 60000)
      setTitle('')
      setDescription('')
      setLocation('')
      setDate(toDateInputValue(initialDate ?? base))
      setStartTime(toTimeInputValue(base))
      setEndTime(toTimeInputValue(end))
      setAddMeet(true)
    }
    // Default to primary calendar
    const primary = calendars.find(c => c.primary)
    setCalendarId(primary?.id || 'primary')
  }, [event, isOpen, initialDate, defaultDurationMin, calendars])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    const startDate = new Date(`${date}T${startTime || '09:00'}`)
    let endDate = new Date(`${date}T${endTime || startTime || '10:00'}`)
    if (endDate <= startDate) {
      // Guard against inverted ranges; fall back to the default duration
      endDate = new Date(startDate.getTime() + defaultDurationMin * 60000)
    }

    const eventData: Partial<CalendarEvent> & { calendarId?: string; conferenceData?: unknown } = {
      summary: title,
      description,
      location,
      start: { dateTime: startDate.toISOString() },
      end: { dateTime: endDate.toISOString() },
      calendarId,
    }

    if (addMeet) {
      eventData.conferenceData = {
        createRequest: {
          requestId: generateRequestId(),
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    }

    onSave(eventData)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={event ? 'EDIT EVENT' : 'NEW EVENT'}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input 
          className={styles.titleInput} 
          placeholder="Event title..." 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />

        {calendars.length > 1 && (
          <div className={styles.field}>
            <label className="mono uppercase text-xs">Calendar</label>
            <select
              className={styles.select}
              value={calendarId}
              onChange={(e) => setCalendarId(e.target.value)}
            >
              {calendars.map(cal => (
                <option key={cal.id} value={cal.id}>
                  {cal.summary}{cal.primary ? ' (Primary)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className={styles.grid}>
          <div className={styles.field}>
            <label className="mono uppercase text-xs">Date & Time</label>
            <div className="flex gap-2">
              <input type="date" className={styles.input} value={date} onChange={(e) => setDate(e.target.value)} required />
              <input type="time" className={styles.input} value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              <span className="self-center">-</span>
              <input type="time" className={styles.input} value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
          </div>
        </div>

        <div className={styles.field}>
          <label className="mono uppercase text-xs">Location</label>
          <input 
            className={styles.input} 
            placeholder="Add location" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Google Meet Toggle */}
        <div 
          className={`${styles.meetToggle} ${addMeet ? styles.meetToggleActive : ''}`}
          onClick={() => setAddMeet(!addMeet)}
        >
          <div className={`${styles.toggleSwitch} ${addMeet ? styles.on : ''}`}>
            <div className={styles.toggleKnob} />
          </div>
          <div className={styles.meetLabel}>
            <div className={styles.meetLabelTitle}>
              <svg className={styles.meetIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
              Add Google Meet video conferencing
            </div>
            <div className={styles.meetLabelSub}>
              {addMeet ? 'A Meet link will be generated and added to this event' : 'No video conferencing for this event'}
            </div>
          </div>
        </div>

        <div className={styles.field}>
          <label className="mono uppercase text-xs">Description</label>
          <textarea 
            className={styles.textarea} 
            placeholder="Add description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className={styles.attachmentPlaceholder}>
          <h4 className="mono uppercase text-sm mb-2">ATTACH DOCUMENTS</h4>
          <button type="button" className="btn btn--outline text-sm py-1">+ Add from Drive</button>
        </div>

        <div className={styles.footer}>
          <button type="button" className="btn btn--outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn">Save Event</button>
        </div>
      </form>
    </Modal>
  )
}
