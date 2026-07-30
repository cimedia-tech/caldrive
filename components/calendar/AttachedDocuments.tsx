"use client";

import React, { useEffect, useState } from "react";
import styles from "./AttachedDocuments.module.css";
import Button from "@/components/ui/Button";

interface AttachedDocumentsProps {
  eventId: string;
  calendarId?: string;
}

export default function AttachedDocuments({ eventId, calendarId = "primary" }: AttachedDocumentsProps) {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const fetchAttachments = async () => {
    try {
      const res = await fetch(`/api/calendar/events/${eventId}/attachments?calendarId=${calendarId}`);
      if (res.ok) {
        const data = await res.json();
        setAttachments(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [eventId, calendarId]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/drive/files?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const attachFile = async (file: any) => {
    try {
      const res = await fetch(`/api/calendar/events/${eventId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendarId,
          fileUrl: file.webViewLink,
          title: file.name,
          mimeType: file.mimeType,
        }),
      });
      if (res.ok) {
        setIsSearching(false);
        setSearchQuery("");
        fetchAttachments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const removeAttachment = async (fileUrl: string) => {
    try {
      const res = await fetch(`/api/calendar/events/${eventId}/attachments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calendarId, fileUrl }),
      });
      if (res.ok) fetchAttachments();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>ATTACHED DOCUMENTS</h3>
      
      {loading ? (
        <div className={styles.empty}>Loading...</div>
      ) : attachments.length > 0 ? (
        <div className={styles.list}>
          {attachments.map((att, i) => (
            <div key={i} className={styles.row}>
              <a href={att.fileUrl} target="_blank" rel="noreferrer" className={styles.link}>
                {att.title}
              </a>
              <button className={styles.removeBtn} onClick={() => removeAttachment(att.fileUrl)}>X</button>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>No attachments</div>
      )}

      {isSearching ? (
        <div className={styles.searchBox}>
          <input 
            type="text" 
            placeholder="Search Drive files..." 
            value={searchQuery}
            onChange={handleSearch}
            className={styles.input}
          />
          {searchResults.length > 0 && (
            <div className={styles.results}>
              {searchResults.map((r, i) => (
                <div key={i} className={styles.resultItem} onClick={() => attachFile(r)}>
                  {r.name}
                </div>
              ))}
            </div>
          )}
          <Button variant="ghost" onClick={() => setIsSearching(false)}>CANCEL</Button>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setIsSearching(true)} className={styles.attachBtn}>
          + ATTACH FROM DRIVE
        </Button>
      )}
    </div>
  );
}
