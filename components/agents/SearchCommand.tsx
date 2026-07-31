"use client";

import React, { useEffect, useState } from "react";
import styles from "./SearchCommand.module.css";
import { useRouter } from "next/navigation";

interface SearchCommandProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchCommand({ isOpen, onClose }: SearchCommandProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{events: {id: string; summary?: string; htmlLink?: string}[], files: {id: string; name?: string; webViewLink?: string}[], summary: string}>({events: [], files: [], summary: ""});
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    
    const timeout = setTimeout(async () => {
      if (query.trim()) {
        try {
          const res = await fetch("/api/agents/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
          });
          if (res.ok) {
            const data = await res.json();
            setResults(data);
          }
        } catch(e) {}
      } else {
        setResults({events: [], files: [], summary: ""});
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <input 
          autoFocus
          className={styles.input}
          placeholder="Search everywhere (Cmd+K)..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <div className={styles.resultsArea}>
            {results.summary && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>AI SUMMARY</div>
                <div className={styles.summary}>{results.summary}</div>
              </div>
            )}
            
            {results.events.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>EVENTS</div>
                {results.events.map((e, i) => (
                  <div key={i} className={styles.item} onClick={() => { router.push(`/calendar/${e.id}`); onClose(); }}>
                    {e.summary}
                  </div>
                ))}
              </div>
            )}
            
            {results.files.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>DOCUMENTS</div>
                {results.files.map((f, i) => (
                  <div key={i} className={styles.item} onClick={() => { router.push(`/documents/${f.id}`); onClose(); }}>
                    {f.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
