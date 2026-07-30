'use client';

import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div className={`spinner spinner--${size} ${className}`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
}
