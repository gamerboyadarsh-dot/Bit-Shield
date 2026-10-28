import React from 'react';
import { PARITY_CHECKS, POSITIONS_META } from '../lib/hamming.js';

export function ParityGroups({
  hoveredPosition = null,
  activeCheck = null,
  onCheckHover = null,
  size = 'md',
  className = '',
  style = {}
}) {
  return (
    <div
      className={`parity-groups-container ${className}`}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ...style
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.375rem',
          maxWidth: size === 'lg' ? '600px' : size === 'sm' ? '380px' : '480px',
          width: '100%'
        }}
        role="table"
        aria-label="Parity check coverage matrix"
      >
        {PARITY_CHECKS.map((check) => {
          const isCheckActive = activeCheck === check.id;
          const coversHovered = hoveredPosition !== null && check.positions.includes(hoveredPosition);

          return (
            <div
              key={check.id}
              role="row"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gap: size === 'sm' ? '0.375rem' : '0.625rem',
                alignItems: 'center',
                padding: '0.125rem 0',
                borderRadius: 'var(--radius-sm)',
                background: isCheckActive ? 'var(--accent-light)' : 'transparent',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={() => onCheckHover && onCheckHover(check.id)}
              onMouseLeave={() => onCheckHover && onCheckHover(null)}
            >
              {POSITIONS_META.map((meta) => {
                const pos = meta.pos;
                const isCovered = check.positions.includes(pos);
                const isCellHovered = hoveredPosition === pos;

                return (
                  <div
                    key={`${check.id}-${pos}`}
                    role="cell"
                    style={{
                      height: size === 'sm' ? '18px' : '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 'var(--radius-sm)',
                      background: isCovered
                        ? isCheckActive || isCellHovered
                          ? 'var(--accent)'
                          : 'var(--border-strong)'
                        : 'transparent',
                      color: isCovered ? '#ffffff' : 'var(--text-subtle)',
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      opacity: isCovered ? 1 : 0.25,
                      border: isCovered ? '1px solid transparent' : '1px dashed var(--border-subtle)',
                      transition: 'all 0.15s ease'
                    }}
                    title={`${check.name} covers pos ${pos} (${meta.name})`}
                  >
                    {isCovered ? check.name : '—'}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          maxWidth: size === 'lg' ? '600px' : size === 'sm' ? '380px' : '480px',
          width: '100%',
          marginTop: '0.5rem',
          padding: '0 0.25rem',
          fontSize: '0.75rem',
          color: 'var(--text-subtle)'
        }}
      >
        <span>Coverage: S₁ (odd pos), S₂ (2,3,6,7), S₄ (4,5,6,7)</span>
        <span>Hover check to highlight</span>
      </div>
    </div>
  );
}
