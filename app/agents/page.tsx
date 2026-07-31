"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import AgentStatusBar from "@/components/agents/AgentStatusBar";
import AgentCard from "@/components/agents/AgentCard";
import AgentFeed from "@/components/agents/AgentFeed";
import AgentChat from "@/components/agents/AgentChat";
import OptimizerPanel from "@/components/agents/OptimizerPanel";
import SearchCommand from "@/components/agents/SearchCommand";
import { AGENT_CAPABILITIES, AgentId } from "@/lib/agents/types";
import { useSettingsStore } from "@/lib/store/settings-store";

function AgentsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentsEnabled = useSettingsStore((s) => s.agentsEnabled);
  const setAgentEnabled = useSettingsStore((s) => s.setAgentEnabled);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  // Deep links: /agents?optimize=1 opens the optimizer, ?search=1 opens search
  const [optimizerOpen, setOptimizerOpen] = useState(() => searchParams.get("optimize") === "1");
  const [searchOpen, setSearchOpen] = useState(() => searchParams.get("search") === "1");

  // Clean the deep-link params from the URL after consuming them
  useEffect(() => {
    if (searchParams.get("optimize") === "1" || searchParams.get("search") === "1") {
      router.replace("/agents");
    }
  }, [searchParams, router]);

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
    setAgentEnabled(id as AgentId, active);
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
              agent={{...agent, active: agentsEnabled[agent.id] !== false, status: 'idle'}} 
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

export default function AgentsPage() {
  return (
    <Suspense>
      <AgentsPageInner />
    </Suspense>
  );
}
