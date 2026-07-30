export const EVENT_COLORS: Record<string, string> = {
  '1': 'var(--color-navy)',
  '2': 'var(--color-forest)',
  '3': 'var(--color-burgundy)',
  '4': 'var(--color-terracotta)',
  '5': 'var(--color-amber)',
  '6': 'var(--color-terracotta)',
  '7': 'var(--color-steel)',
  '8': 'var(--color-steel)',
  '9': 'var(--color-navy)',
  '10': 'var(--color-forest)',
  '11': 'var(--color-burgundy)',
}

export function getEventColor(colorId?: string): string {
  if (!colorId || !EVENT_COLORS[colorId]) {
    return 'var(--color-steel)' // Default fallback
  }
  return EVENT_COLORS[colorId]
}

const AGENT_COLORS: Record<string, string> = {
  'prep-agent': 'var(--color-navy)',
  'sync-agent': 'var(--color-forest)',
  'content-agent': 'var(--color-amber)',
  'calendar-optimizer': 'var(--color-terracotta)',
  'search-intelligence': 'var(--color-steel)',
  'workflow-automator': 'var(--color-burgundy)',
}

export function getAgentColor(agentId: string): string {
  return AGENT_COLORS[agentId] || 'var(--color-steel)' // Default fallback
}
