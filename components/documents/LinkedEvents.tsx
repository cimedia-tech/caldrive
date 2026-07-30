"use client";

import React, { useEffect, useState } from "react";
import styles from "./LinkedEvents.module.css";
import Link from "next/link";

interface LinkedEventsProps {
  fileUrl: string;
}

export default function LinkedEvents({ fileUrl }: LinkedEventsProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const timeMin = new Date();
        timeMin.setDate(timeMin.getDate() - 30);
        const timeMax = new Date();
        timeMax.setDate(timeMax.getDate() + 30);
        
        const res = await fetch(`/api/calendar/events?calendarId=primary&timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}`);
        if (res.ok) {
          const data = await res.json();
          const linked = data.filter((ev: any) => 
            ev.attachments?.some((att: any) => att.fileUrl === fileUrl)
          );
          setEvents(linked);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    if (fileUrl) fetchEvents();
  }, [fileUrl]);

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>LINKED EVENTS</h3>
      
      {loading ? (
        <div className={styles.empty}>Searching...</div>
      ) : events.length > 0 ? (
        <div className={styles.list}>
          {events.map((ev) => (
            <Link key={ev.id} href={`/calendar/${ev.id}`} className={styles.eventRow}>
              <span className={styles.date}>
                {new Date(ev.start?.dateTime || ev.start?.date || "").toLocaleDateString()}
              </span>
              <span className={styles.title}>{ev.summary || "(No title)"}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>No linked events</div>
      )}
    </div>
  );
}
