import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documents',
  description: 'Browse, organize, and upload your Drive files.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
