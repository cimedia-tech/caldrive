import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agents',
  description: 'Your AI agent team: briefings, sync alerts, recaps, and schedule optimization.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
