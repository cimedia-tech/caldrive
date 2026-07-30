"use client";

import React, { useEffect, useState } from "react";
import styles from "./AgentFeed.module.css";
import Button from "@/components/ui/Button";
import { AGENT_CAPABILITIES } from "@/lib/agents/types";

export default function AgentFeed() {
  const [feed, setFeed] = useState<any[]>([]);

  useEffect(() => {
    const evtSource = new EventSource("/api/agents/feed");
    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setFeed((prev) => [data, ...prev].slice(0, 50));
    };
    return () => evtSource.close();
  }, []);

  const clearFeed = () => setFeed([]);

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
