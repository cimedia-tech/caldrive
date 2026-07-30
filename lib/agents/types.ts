export type AgentId = 'prep-agent' | 'sync-agent' | 'content-agent' | 'calendar-optimizer' | 'search-intelligence' | 'workflow-automator';

export interface AgentMessage {
  id: string;
  agentId: AgentId;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    relatedEventIds?: string[];
    relatedFileIds?: string[];
    suggestions?: string[];
  };
}

export interface AgentCapability {
  id: AgentId;
  name: string;
  description: string;
  triggers: string[];
  color: string;
  icon: string;
}

export const AGENT_CAPABILITIES: AgentCapability[] = [
  { id: 'prep-agent', name: 'Prep Agent', description: 'Assembles document briefings before meetings', triggers: ['meeting in 30 min', 'event starting soon'], color: 'var(--color-navy)', icon: 'briefcase' },
  { id: 'sync-agent', name: 'Sync Agent', description: 'Monitors Drive for changes and notifies', triggers: ['file modified', 'new file in folder'], color: 'var(--color-forest)', icon: 'refresh' },
  { id: 'content-agent', name: 'Content Agent', description: 'Generates meeting recaps and document summaries', triggers: ['meeting ended', 'summarize document'], color: 'var(--color-amber)', icon: 'edit' },
  { id: 'calendar-optimizer', name: 'Calendar Optimizer', description: 'Suggests schedule improvements and finds focus blocks', triggers: ['schedule analysis', 'find free time'], color: 'var(--color-terracotta)', icon: 'clock' },
  { id: 'search-intelligence', name: 'Search Intelligence', description: 'Cross-domain search across events and documents', triggers: ['search query', 'find related'], color: 'var(--color-steel)', icon: 'search' },
  { id: 'workflow-automator', name: 'Workflow Automator', description: 'Chains automated actions across calendar and drive', triggers: ['auto-create folder', 'schedule follow-up'], color: 'var(--color-burgundy)', icon: 'zap' },
];
