/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import React, { useState, useEffect } from 'react'
import type { CalendarEvent } from '@/lib/store/calendar-store'
import styles from './EventModal.module.css'
import Modal from '@/components/ui/Modal'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  event: CalendarEvent | null
  onSave: (eventData: Partial<CalendarEvent>) => void
}

export function EventModal({ isOpen, onClose, event, onSave }: EventModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  
  useEffect(() => {
    if (event) {
      setTitle(event.summary || '')
      setDescription(event.description || '')
      setLocation(event.location || '')
    } else {
      setTitle('')
      setDescription('')
      setLocation('')
    }
  }, [event, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      summary: title,
      description,
      location,
      // Defaulting times for now
      start: { dateTime: new Date().toISOString() },
      end: { dateTime: new Date(Date.now() + 3600000).toISOString() }
    })
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
        
        <div className={styles.grid}>
          <div className={styles.field}>
            <label className="mono uppercase text-xs">Date & Time</label>
            <div className="flex gap-2">
              <input type="date" className={styles.input} />
              <input type="time" className={styles.input} />
              <span className="self-center">-</span>
              <input type="time" className={styles.input} />
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
