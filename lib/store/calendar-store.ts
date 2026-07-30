import { create } from 'zustand'

export interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: { dateTime?: string; date?: string }
  end: { dateTime?: string; date?: string }
  location?: string
  colorId?: string
  attendees?: { email: string; displayName?: string; responseStatus?: string }[]
  attachments?: { fileUrl: string; title: string; mimeType?: string }[]
  htmlLink?: string
  status?: string
}

export interface Calendar {
  id: string
  summary: string
  backgroundColor?: string
  primary?: boolean
}

export type CalendarView = 'week' | 'month' | 'agenda'

interface CalendarStore {
  calendars: Calendar[]
  events: CalendarEvent[]
  activeCalendarIds: string[]
  activeView: CalendarView
  currentDate: Date
  selectedEventId: string | null
  isEventModalOpen: boolean
  editingEvent: CalendarEvent | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setCalendars: (calendars: Calendar[]) => void
  setEvents: (events: CalendarEvent[]) => void
  addEvent: (event: CalendarEvent) => void
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void
  removeEvent: (id: string) => void
  setActiveCalendarIds: (ids: string[]) => void
  toggleCalendar: (id: string) => void
  setActiveView: (view: CalendarView) => void
  setCurrentDate: (date: Date) => void
  selectEvent: (id: string | null) => void
  openEventModal: (event?: CalendarEvent) => void
  closeEventModal: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useCalendarStore = create<CalendarStore>((set) => ({
  calendars: [],
  events: [],
  activeCalendarIds: [],
  activeView: 'week',
  currentDate: new Date(),
  selectedEventId: null,
  isEventModalOpen: false,
  editingEvent: null,
  isLoading: false,
  error: null,

  setCalendars: (calendars) => set({ calendars }),
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  updateEvent: (id, patch) => set((state) => ({
    events: state.events.map(e => e.id === id ? { ...e, ...patch } : e)
  })),
  removeEvent: (id) => set((state) => ({
    events: state.events.filter(e => e.id !== id)
  })),
  setActiveCalendarIds: (ids) => set({ activeCalendarIds: ids }),
  toggleCalendar: (id) => set((state) => ({
    activeCalendarIds: state.activeCalendarIds.includes(id)
      ? state.activeCalendarIds.filter(cid => cid !== id)
      : [...state.activeCalendarIds, id]
  })),
  setActiveView: (view) => set({ activeView: view }),
  setCurrentDate: (date) => set({ currentDate: date }),
  selectEvent: (id) => set({ selectedEventId: id }),
  openEventModal: (event) => set({ isEventModalOpen: true, editingEvent: event || null }),
  closeEventModal: () => set({ isEventModalOpen: false, editingEvent: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error })
}))
