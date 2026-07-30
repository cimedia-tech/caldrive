'use client'

import React from 'react'
import styles from './ViewToggle.module.css'

export type ViewType = 'week' | 'month' | 'agenda'

interface ViewToggleProps {
  activeView: ViewType
  onChange: (view: ViewType) => void
}

export function ViewToggle({ activeView, onChange }: ViewToggleProps) {
  const views: ViewType[] = ['week', 'month', 'agenda']
  
  return (
    <div className={styles.container}>
      {views.map((view) => (
        <button
          key={view}
          className={`${styles.button} ${activeView === view ? styles.active : ''} mono uppercase`}
          onClick={() => onChange(view)}
        >
          {view}
        </button>
      ))}
      <div 
        className={styles.indicator} 
        style={{
          transform: `translateX(${views.indexOf(activeView) * 100}%)`
        }} 
      />
    </div>
  )
}
