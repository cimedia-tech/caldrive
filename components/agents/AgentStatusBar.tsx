"use client";

import React from "react";
import styles from "./AgentStatusBar.module.css";
import { AGENT_CAPABILITIES } from "@/lib/agents/types";
import { useAgentStore } from "@/lib/store/agent-store";

export default function AgentStatusBar() {
  const agents = useAgentStore((state: any) => state.agents || {});

  return (
    <div className={styles.bar}>
      {AGENT_CAPABILITIES.map((cap) => {
        const agent = agents[cap.id];
        const status = agent?.status || "idle";
        
        return (
          <div key={cap.id} className={styles.item}>
            <div className={styles.square} style={{ backgroundColor: cap.color }} />
            <div className={styles.name}>{cap.name.substring(0, 3).toUpperCase()}</div>
            <div className={`${styles.statusDot} ${styles[status]}`} />
          </div>
        );
      })}
    </div>
  );
}
