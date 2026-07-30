"use client";

import React, { useState, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import AgentStatusBar from "@/components/agents/AgentStatusBar";
import AgentCard from "@/components/agents/AgentCard";
import AgentFeed from "@/components/agents/AgentFeed";
import AgentChat from "@/components/agents/AgentChat";
import OptimizerPanel from "@/components/agents/OptimizerPanel";
import SearchCommand from "@/components/agents/SearchCommand";
import { AGENT_CAPABILITIES } from "@/lib/agents/types";

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [optimizerOpen, setOptimizerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggle = (id: string, active: boolean) => {
    console.log("Toggle", id, active);
  };

  const activeAgentInfo = selectedAgent ? AGENT_CAPABILITIES.find(a => a.id === selectedAgent) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar title="AGENT COMMAND CENTER" />
      <AgentStatusBar />
      
      <div style={{ display: 'flex', flexGrow: 1, padding: 'var(--space-6)', gap: 'var(--space-6)', overflow: 'hidden' }}>
        
        <div style={{ flex: '1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', overflowY: 'auto' }}>
          {AGENT_CAPABILITIES.map(agent => (
            <AgentCard 
              key={agent.id} 
              agent={{...agent, active: true, status: 'idle'}} 
              onToggle={handleToggle}
              onClick={setSelectedAgent}
            />
          ))}
        </div>

        <div style={{ flex: '1' }}>
          <AgentFeed />
        </div>

        <div style={{ flex: '1' }}>
          {activeAgentInfo ? (
            <AgentChat 
              agentId={activeAgentInfo.id} 
              agentName={activeAgentInfo.name}
              agentColor={activeAgentInfo.color}
              onClose={() => setSelectedAgent(null)}
            />
          ) : (
            <div style={{ border: '2px dashed var(--color-border)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontStyle: 'italic', opacity: 0.6 }}>
              Select an agent to chat
            </div>
          )}
        </div>
      </div>

      <OptimizerPanel isOpen={optimizerOpen} onClose={() => setOptimizerOpen(false)} />
      <SearchCommand isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
