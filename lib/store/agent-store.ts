import { create } from 'zustand'

export type AgentStatus = 'active' | 'idle' | 'processing'
export type ActivityType = 'info' | 'suggestion' | 'action' | 'warning'

export interface AgentConfig {
  id: string
  name: string
  icon: string
  color: string
  description: string
  enabled: boolean
  status: AgentStatus
}

export interface AgentActivity {
  id: string
  agentId: string
  message: string
  timestamp: string
  relatedEventId?: string
  relatedFileId?: string
  actionType: ActivityType
}

export interface Suggestion {
  id: string
  type: 'consolidate' | 'focus_block' | 'reschedule'
  description: string
  affectedEvents: string[]
}

export interface Conflict {
  event1Id: string
  event2Id: string
  resolution: string
}

export interface TimeAnalytics {
  meetings: number
  focus: number
  admin: number
  free: number
}

interface AgentStore {
  agents: AgentConfig[]
  feed: AgentActivity[]
  isConnected: boolean
  isOptimizerOpen: boolean
  optimizerSuggestions: Suggestion[]
  conflicts: Conflict[]
  timeAnalytics: TimeAnalytics | null
  
  setAgents: (agents: AgentConfig[]) => void
  toggleAgent: (id: string) => void
  setAgentStatus: (id: string, status: AgentStatus) => void
  addFeedEntry: (activity: AgentActivity) => void
  clearFeed: () => void
  setConnected: (connected: boolean) => void
  openOptimizer: () => void
  closeOptimizer: () => void
  setSuggestions: (suggestions: Suggestion[]) => void
  removeSuggestion: (id: string) => void
  setConflicts: (conflicts: Conflict[]) => void
  setTimeAnalytics: (analytics: TimeAnalytics | null) => void
}

const defaultAgents: AgentConfig[] = [
  { id: 'prep-agent', name: 'Prep Agent', icon: 'briefcase', color: 'var(--navy)', description: 'Assembles document briefings before meetings', enabled: true, status: 'idle' },
  { id: 'sync-agent', name: 'Sync Agent', icon: 'refresh', color: 'var(--forest)', description: 'Monitors Drive for changes', enabled: true, status: 'active' },
  { id: 'content-agent', name: 'Content Agent', icon: 'edit', color: 'var(--amber)', description: 'Generates recaps and summaries', enabled: true, status: 'idle' },
  { id: 'calendar-optimizer', name: 'Calendar Optimizer', icon: 'clock', color: 'var(--terracotta)', description: 'Suggests schedule improvements', enabled: true, status: 'idle' },
  { id: 'search-intelligence', name: 'Search Intelligence', icon: 'search', color: 'var(--steel)', description: 'Cross-domain search', enabled: true, status: 'active' },
  { id: 'workflow-automator', name: 'Workflow Automator', icon: 'zap', color: 'var(--burgundy)', description: 'Chains actions automatically', enabled: true, status: 'idle' }
]

export const useAgentStore = create<AgentStore>((set) => ({
  agents: defaultAgents,
  feed: [],
  isConnected: true,
  isOptimizerOpen: false,
  optimizerSuggestions: [],
  conflicts: [],
  timeAnalytics: null,

  setAgents: (agents) => set({ agents }),
  toggleAgent: (id) => set((state) => ({
    agents: state.agents.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a)
  })),
  setAgentStatus: (id, status) => set((state) => ({
    agents: state.agents.map(a => a.id === id ? { ...a, status } : a)
  })),
  addFeedEntry: (activity) => set((state) => {
    const newFeed = [activity, ...state.feed]
    if (newFeed.length > 100) newFeed.pop()
    return { feed: newFeed }
  }),
  clearFeed: () => set({ feed: [] }),
  setConnected: (connected) => set({ isConnected: connected }),
  openOptimizer: () => set({ isOptimizerOpen: true }),
  closeOptimizer: () => set({ isOptimizerOpen: false }),
  setSuggestions: (suggestions) => set({ optimizerSuggestions: suggestions }),
  removeSuggestion: (id) => set((state) => ({
    optimizerSuggestions: state.optimizerSuggestions.filter(s => s.id !== id)
  })),
  setConflicts: (conflicts) => set({ conflicts }),
  setTimeAnalytics: (analytics) => set({ timeAnalytics: analytics })
}))
