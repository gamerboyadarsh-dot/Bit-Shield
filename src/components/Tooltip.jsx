import React, { useState } from 'react';

export function Tooltip({
  content,
  children,
  position = 'top' // 'top' | 'bottom'
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            [position === 'top' ? 'bottom' : 'top']: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--text-main)',
            color: 'var(--bg-card)',
            fontSize: '0.75rem',
            padding: '0.25rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
            whiteSpace: 'nowrap',
            zIndex: 50,
            pointerEvents: 'none',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
}
