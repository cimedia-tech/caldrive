'use client';

import React from 'react';

export interface BadgeProps {
  label: string;
  color?: 'navy' | 'terracotta' | 'forest' | 'amber' | 'steel' | 'burgundy';
  variant?: 'filled' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({ 
  label, 
  color = 'navy', 
  variant = 'filled', 
  size = 'sm',
  className = ''
}: BadgeProps) {
  return (
    <span className={`badge badge--${color} badge--${variant} badge--${size} ${className}`}>
      {label}
    </span>
  );
}
