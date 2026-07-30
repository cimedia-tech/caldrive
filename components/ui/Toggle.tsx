'use client';

import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export default function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <label className={`toggle-wrapper ${disabled ? 'toggle--disabled' : ''}`}>
      {label && <span className="toggle-label">{label}</span>}
      <div 
        className={`toggle-track ${checked ? 'toggle-track--checked' : ''}`}
        onClick={() => !disabled && onChange(!checked)}
        role="switch"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onChange(!checked);
          }
        }}
      >
        <div className={`toggle-thumb ${checked ? 'toggle-thumb--checked' : ''}`} />
      </div>
    </label>
  );
}
