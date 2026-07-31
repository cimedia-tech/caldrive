import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AgentId } from '@/lib/agents/types'

export type WeekStart = 0 | 1 // 0 = Sunday, 1 = Monday
export type TimeFormat = '12h' | '24h'
export type CalendarDefaultView = 'week' | 'month' | 'agenda'
export type DocsViewMode = 'grid' | 'list'
export type DocsSortField = 'name' | 'modifiedTime' | 'size'

export interface SettingsState {
  // Calendar
  weekStartsOn: WeekStart
  timeFormat: TimeFormat
  defaultCalendarView: CalendarDefaultView
  dayStartHour: number // hour the week view scrolls to on open (0–23)
  defaultEventDurationMin: number

  // Documents
  docsViewMode: DocsViewMode
  docsSortBy: DocsSortField

  // Agents
  agentsEnabled: Record<AgentId, boolean>
  agentNotifications: boolean
  feedMaxItems: number

  // Actions
  setWeekStartsOn: (v: WeekStart) => void
  setTimeFormat: (v: TimeFormat) => void
  setDefaultCalendarView: (v: CalendarDefaultView) => void
  setDayStartHour: (v: number) => void
  setDefaultEventDurationMin: (v: number) => void
  setDocsViewMode: (v: DocsViewMode) => void
  setDocsSortBy: (v: DocsSortField) => void
  setAgentEnabled: (id: AgentId, enabled: boolean) => void
  setAgentNotifications: (v: boolean) => void
  setFeedMaxItems: (v: number) => void
  resetToDefaults: () => void
}

const DEFAULT_AGENTS_ENABLED: Record<AgentId, boolean> = {
  'prep-agent': true,
  'sync-agent': true,
  'content-agent': true,
  'calendar-optimizer': true,
  'search-intelligence': true,
  'workflow-automator': true,
}

const DEFAULTS = {
  weekStartsOn: 1 as WeekStart, // Monday — matches the MON-first grid design
  timeFormat: '12h' as TimeFormat,
  defaultCalendarView: 'month' as CalendarDefaultView,
  dayStartHour: 8,
  defaultEventDurationMin: 60,
  docsViewMode: 'grid' as DocsViewMode,
  docsSortBy: 'name' as DocsSortField,
  agentsEnabled: DEFAULT_AGENTS_ENABLED,
  agentNotifications: true,
  feedMaxItems: 50,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,

      setWeekStartsOn: (weekStartsOn) => set({ weekStartsOn }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      setDefaultCalendarView: (defaultCalendarView) => set({ defaultCalendarView }),
      setDayStartHour: (dayStartHour) => set({ dayStartHour: Math.min(23, Math.max(0, dayStartHour)) }),
      setDefaultEventDurationMin: (defaultEventDurationMin) => set({ defaultEventDurationMin }),
      setDocsViewMode: (docsViewMode) => set({ docsViewMode }),
      setDocsSortBy: (docsSortBy) => set({ docsSortBy }),
      setAgentEnabled: (id, enabled) =>
        set((state) => ({ agentsEnabled: { ...state.agentsEnabled, [id]: enabled } })),
      setAgentNotifications: (agentNotifications) => set({ agentNotifications }),
      setFeedMaxItems: (feedMaxItems) => set({ feedMaxItems: Math.min(200, Math.max(10, feedMaxItems)) }),
      resetToDefaults: () => set({ ...DEFAULTS, agentsEnabled: { ...DEFAULT_AGENTS_ENABLED } }),
    }),
    { name: 'caldrive-settings' }
  )
)
