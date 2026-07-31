"use client";

import React from "react";
import styles from "./AgentCard.module.css";
import Toggle from "@/components/ui/Toggle";

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    description: string;
    color: string;
    icon: string;
    active: boolean;
    status: string;
  }; 
  onToggle: (id: string, active: boolean) => void;
  onClick: (id: string) => void;
}

export default function AgentCard({ agent, onToggle, onClick }: AgentCardProps) {
  return (
    <div 
      className={styles.card} 
      style={{ borderLeftColor: agent.color }}
      onClick={() => onClick(agent.id)}
    >
      <div className={styles.header}>
        <div className={styles.name}>{agent.name}</div>
        <div onClick={(e) => e.stopPropagation()}>
          <Toggle checked={agent.active} onChange={(checked) => onToggle(agent.id, checked)} />
        </div>
      </div>
      <div className={styles.description}>{agent.description}</div>
      <div className={styles.status}>
        {agent.status === 'processing' ? (
          <span className={styles.processing}>
            <span className={styles.spinner}></span> PROCESSING
          </span>
        ) : agent.active ? (
          <span className={styles.active}>ACTIVE</span>
        ) : (
          <span className={styles.idle}>IDLE</span>
        )}
      </div>
    </div>
  );
}
