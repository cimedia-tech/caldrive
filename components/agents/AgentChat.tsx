"use client";

import React, { useState } from "react";
import styles from "./AgentChat.module.css";
import Button from "@/components/ui/Button";

interface AgentChatProps {
  agentId: string;
  agentName: string;
  agentColor: string;
  onClose: () => void;
}

export default function AgentChat({ agentId, agentName, agentColor, onClose }: AgentChatProps) {
  const [messages, setMessages] = useState<{role: 'user'|'agent', text: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, message: msg }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'agent', text: data.response }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ borderLeftColor: agentColor }}>
        <h2 className={styles.title}>{agentName}</h2>
        <button className={styles.closeBtn} onClick={onClose}>X</button>
      </div>
      
      <div className={styles.history}>
        {messages.map((m, i) => (
          <div key={i} className={`${styles.message} ${m.role === 'user' ? styles.user : styles.agent}`}>
            {m.role === 'agent' && <div className={styles.agentBar} style={{ backgroundColor: agentColor }} />}
            <div className={styles.text}>{m.text}</div>
          </div>
        ))}
        {loading && <div className={styles.typing}>Agent is typing...</div>}
      </div>

      <div className={styles.inputArea}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className={styles.input}
          placeholder="Ask something..."
        />
        <Button variant="primary" onClick={handleSend} disabled={loading}>SEND</Button>
      </div>
    </div>
  );
}
