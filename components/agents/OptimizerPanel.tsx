"use client";

import React, { useEffect, useState } from "react";
import styles from "./OptimizerPanel.module.css";

interface OptimizerPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OptimizerPanel({ isOpen, onClose }: OptimizerPanelProps) {
  const [suggestions, setSuggestions] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const timeMin = new Date().toISOString();
      const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      fetch("/api/agents/optimizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeMin, timeMax }),
      })
        .then(res => res.json())
        .then(data => setSuggestions(data.suggestions))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>CALENDAR OPTIMIZER</h2>
          <button className={styles.closeBtn} onClick={onClose}>X</button>
        </div>
        
        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
            </div>
          ) : (
            <div className={styles.results}>
              <div className={styles.markdown}>{suggestions}</div>
            </div>
          )}
        </div>
        
        <div className={styles.analytics}>
          <div className={styles.analyticsTitle}>TIME ANALYTICS (EST.)</div>
          <div className={styles.bar}>
            <div className={styles.barSegment} style={{ width: '40%', backgroundColor: 'var(--color-navy)' }}></div>
            <div className={styles.barSegment} style={{ width: '30%', backgroundColor: 'var(--color-forest)' }}></div>
            <div className={styles.barSegment} style={{ width: '30%', backgroundColor: 'var(--color-terracotta)' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
