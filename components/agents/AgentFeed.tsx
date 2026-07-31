"use client";

import React, { useEffect, useState } from "react";
import styles from "./AgentFeed.module.css";
import Button from "@/components/ui/Button";
import { AGENT_CAPABILITIES } from "@/lib/agents/types";
import { useAgentStore, AgentActivity } from "@/lib/store/agent-store";
import { useSettingsStore } from "@/lib/store/settings-store";

export default function AgentFeed() {
  const [feed, setFeed] = useState<AgentActivity[]>([]);
  const feedMaxItems = useSettingsStore((s) => s.feedMaxItems);
  const agentsEnabled = useSettingsStore((s) => s.agentsEnabled);
  const addFeedEntry = useAgentStore((state) => state.addFeedEntry);
  const clearStoreFeed = useAgentStore((state) => state.clearFeed);

  useEffect(() => {
    const evtSource = new EventSource("/api/agents/feed");
    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Skip activity from agents the user has disabled in Settings
      if (data.agentId && agentsEnabled[data.agentId as keyof typeof agentsEnabled] === false) return;
      setFeed((prev) => [data, ...prev].slice(0, feedMaxItems));
      addFeedEntry(data);
    };
    return () => evtSource.close();
  }, [feedMaxItems, agentsEnabled, addFeedEntry]);

  const clearFeed = () => { setFeed([]); clearStoreFeed(); };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button variant="ghost" onClick={clearFeed}>CLEAR FEED</Button>
      </div>
      <div className={styles.list}>
        {feed.length === 0 ? (
          <div className={styles.empty}>Agents are quiet...</div>
        ) : (
          feed.map((item, i) => {
            const agent = AGENT_CAPABILITIES.find(a => a.id === item.agentId);
            const color = agent?.color || "var(--color-foreground)";
            return (
              <div key={i} className={styles.entry} style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={styles.dot} style={{ backgroundColor: color }} />
                <div className={styles.time}>{new Date(item.timestamp).toLocaleTimeString()}</div>
                <div className={styles.message}>{item.message}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
