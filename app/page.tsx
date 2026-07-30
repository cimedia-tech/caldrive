"use client";

import React from "react";
import TopBar from "@/components/layout/TopBar";
import AgentFeed from "@/components/agents/AgentFeed";
import AgentStatusBar from "@/components/agents/AgentStatusBar";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function DashboardPage() {
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar title="DASHBOARD" />
      
      <div style={{ display: 'flex', flexGrow: 1, padding: 'var(--space-6)', gap: 'var(--space-6)' }}>
        
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', borderBottom: '2px solid', paddingBottom: '8px', marginBottom: '16px' }}>CALENDAR</h2>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, marginBottom: '24px' }}>{date}</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ border: '2px solid', padding: '16px', boxShadow: '4px 4px 0 #000' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', marginBottom: '8px' }}>10:00 AM</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.25rem' }}>Design Review</div>
              </div>
            </div>
            
            <Link href="/calendar" style={{ display: 'inline-block', marginTop: '24px', fontFamily: 'var(--font-mono)', fontWeight: 700, textDecoration: 'none', color: 'var(--color-navy)' }}>
              View Full Calendar &rarr;
            </Link>
          </div>
        </div>

        <div style={{ flex: '1.5', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', borderBottom: '2px solid', paddingBottom: '8px', marginBottom: '16px' }}>AGENT FEED</h2>
          <AgentFeed />
        </div>

        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', borderBottom: '2px solid', paddingBottom: '8px', marginBottom: '16px' }}>STATUS</h2>
            <AgentStatusBar />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '32px' }}>
            <Button variant="primary" style={{ width: '100%' }}>NEW EVENT</Button>
            <Button variant="outline" style={{ width: '100%' }}>UPLOAD FILE</Button>
            <Button variant="outline" style={{ width: '100%', borderColor: 'var(--color-terracotta)', color: 'var(--color-terracotta)' }}>OPTIMIZE SCHEDULE</Button>
          </div>
        </div>

      </div>
    </div>
  );
}
