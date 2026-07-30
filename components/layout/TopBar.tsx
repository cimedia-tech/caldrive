'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import styles from './TopBar.module.css'

export default function TopBar({ title: titleProp }: { title?: string } = {}) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const title = titleProp || (pathname === '/' ? 'Home' : 
                pathname.startsWith('/calendar') ? 'Calendar' :
                pathname.startsWith('/documents') ? 'Documents' :
                pathname.startsWith('/agents') ? 'Agents' :
                pathname.startsWith('/settings') ? 'Settings' : 'CalDrive')

  const initials = session?.user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?'

  return (
    <header className={styles.topbar}>
      <div className={styles.title}>{title}</div>
      <div className={styles.searchContainer}>
        <input 
          type="text" 
          className={styles.search} 
          placeholder="Search events & documents... (⌘K)" 
          onClick={() => { /* open search command */ }}
          readOnly
        />
      </div>
      <div className={styles.actions}>
        <button className={styles.notifBtn}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span className={styles.notifBadge}>3</span>
        </button>
        
        <div style={{ position: 'relative' }}>
          <div className={styles.avatar} onClick={() => setMenuOpen(!menuOpen)}>
            {initials}
          </div>
          {menuOpen && (
            <div className={styles.userMenu}>
              <div className={styles.menuItem} style={{ borderBottom: '1px solid var(--border)', opacity: 0.7, fontSize: '0.875rem' }}>
                {session?.user?.email || 'Not signed in'}
              </div>
              <button className={styles.menuItem} onClick={() => signOut()}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
