"use client";

import React, { useEffect, useState } from "react";
import styles from "./PrepBriefing.module.css";
import Button from "@/components/ui/Button";

interface PrepBriefingProps {
  eventId: string;
  calendarId?: string;
}

export default function PrepBriefing({ eventId, calendarId = "primary" }: PrepBriefingProps) {
  const [briefing, setBriefing] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchBriefing = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, calendarId }),
      });
      if (res.ok) {
        const data = await res.json();
        setBriefing(data.text);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => { if (!cancelled) fetchBriefing(); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>PREP BRIEFING</h3>
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Preparing briefing...</span>
        </div>
      ) : (
        <div className={styles.content}>
          {briefing ? (
            <div className={styles.markdown}>{briefing}</div>
          ) : (
            <div className={styles.empty}>No briefing available.</div>
          )}
        </div>
      )}
      <Button variant="outline" onClick={fetchBriefing} className={styles.regenBtn} disabled={loading}>
        REGENERATE
      </Button>
    </div>
  );
}
