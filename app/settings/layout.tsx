import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Customize CalDrive: calendar display, document defaults, and agent behavior.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
