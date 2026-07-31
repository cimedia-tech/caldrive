'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAgentStore } from '@/lib/store/agent-store'
import { useSettingsStore } from '@/lib/store/settings-store'
import styles from './TopBar.module.css'

export default function TopBar({ title: titleProp }: { title?: string } = {}) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const feedCount = useAgentStore((state) => state.feed.length)
  const agentNotifications = useSettingsStore((s) => s.agentNotifications)

  const title = titleProp || (pathname === '/' ? 'Home' : 
                pathname.startsWith('/calendar') ? 'Calendar' :
                pathname.startsWith('/documents') ? 'Documents' :
                pathname.startsWith('/agents') ? 'Agents' :
                pathname.startsWith('/settings') ? 'Settings' : 'CalDrive')

  const initials = session?.user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || ''

  return (
    <header className={styles.topbar}>
      <div className={styles.title}>{title}</div>
      <div className={styles.searchContainer}>
        <input 
          type="text" 
          className={styles.search} 
          placeholder="Search events & documents... (⌘K)" 
          onClick={() => router.push('/agents?search=1')}
          readOnly
        />
      </div>
      <div className={styles.actions}>
        <button className={styles.notifBtn} title="Agent activity" onClick={() => router.push('/agents')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          {agentNotifications && feedCount > 0 && <span className={styles.notifBadge}>{feedCount > 9 ? '9+' : feedCount}</span>}
        </button>
        
        {session ? (
          <div style={{ position: 'relative' }}>
            <div className={styles.avatar} onClick={() => setMenuOpen(!menuOpen)} title={session.user?.email || 'User Account'}>
              {initials || session.user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            {menuOpen && (
              <div className={styles.userMenu}>
                <div className={styles.menuItem} style={{ borderBottom: '1px solid var(--border)', opacity: 0.7, fontSize: '0.875rem' }}>
                  {session.user?.email}
                </div>
                <button className={styles.menuItem} onClick={() => signOut()}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            className={styles.signInBtn}
            onClick={() => signIn('google')}
            disabled={status === 'loading'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C6.721,2,2,6.721,2,12.545s4.721,10.545,10.545,10.545c6.191,0,10.292-4.354,10.292-10.472c0-0.697-0.075-1.378-0.201-2.039 H12.545z"/>
            </svg>
            Sign In with Google
          </button>
        )}
      </div>
    </header>
  )
}

