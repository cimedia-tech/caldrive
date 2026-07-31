import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calendar',
  description: 'View and manage your schedule in month, week, and agenda views.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
