"use client";

import React from "react";
import styles from "./AgentStatusBar.module.css";
import { AGENT_CAPABILITIES } from "@/lib/agents/types";
import { useAgentStore } from "@/lib/store/agent-store";
import { useSettingsStore } from "@/lib/store/settings-store";

export default function AgentStatusBar() {
  const agents = useAgentStore((state) => state.agents);
  const agentsEnabled = useSettingsStore((s) => s.agentsEnabled);

  return (
    <div className={styles.bar}>
      {AGENT_CAPABILITIES.map((cap) => {
        // agents is an array — look the agent up by id
        const agent = agents.find((a) => a.id === cap.id);
        const enabled = agentsEnabled[cap.id] !== false;
        const status = !enabled ? "idle" : agent?.status || "idle";

        return (
          <div
            key={cap.id}
            className={styles.item}
            title={`${cap.name} — ${enabled ? status : "disabled"}`}
            style={{ opacity: enabled ? 1 : 0.35 }}
          >
            <div className={styles.square} style={{ backgroundColor: cap.color }} />
            <div className={styles.name}>{cap.name.substring(0, 3).toUpperCase()}</div>
            <div className={`${styles.statusDot} ${styles[status]}`} />
          </div>
        );
      })}
    </div>
  );
}
