'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

let globalToasts: ToastItem[] = [];
let listeners: ((toasts: ToastItem[]) => void)[] = [];

const addToast = (message: string, type: ToastType = 'info') => {
  const id = Math.random().toString(36).substring(2, 9);
  globalToasts = [...globalToasts, { id, message, type }];
  listeners.forEach(l => l([...globalToasts]));

  setTimeout(() => {
    globalToasts = globalToasts.filter(t => t.id !== id);
    listeners.forEach(l => l([...globalToasts]));
  }, 4000);
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>(globalToasts);

  useEffect(() => {
    const listener = (newToasts: ToastItem[]) => setToasts(newToasts);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  return { toast: addToast, toasts };
}

export default function Toast() {
  const { toasts } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type} animate-slide-up`}>
          {t.message}
        </div>
      ))}
    </div>,
    document.body
  );
}
