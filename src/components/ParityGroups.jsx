import React from 'react';
import { motion } from 'framer-motion';
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
          gap: '0.45rem',
          maxWidth: size === 'lg' ? '680px' : size === 'sm' ? '420px' : '560px',
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
                gap: size === 'sm' ? '0.35rem' : size === 'lg' ? '0.85rem' : '0.6rem',
                alignItems: 'center',
                padding: '0.3rem 0',
                borderRadius: 'var(--radius-md)',
                background: isCheckActive ? 'var(--accent-light)' : 'transparent',
                border: isCheckActive ? '1px solid var(--border-glow)' : '1px solid transparent',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
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
                    key={pos}
                    role="cell"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '24px'
                    }}
                  >
                    {isCovered ? (
                      <motion.div
                        animate={{
                          scale: isCellHovered || isCheckActive ? 1.25 : 1
                        }}
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: isCellHovered
                            ? 'var(--accent-cyan)'
                            : isCheckActive
                            ? 'var(--accent)'
                            : 'var(--text-subtle)',
                          boxShadow: isCellHovered || isCheckActive ? '0 0 10px var(--accent-cyan)' : 'none',
                          opacity: isCovered ? 1 : 0.2,
                          transition: 'background-color 0.2s ease, box-shadow 0.2s ease'
                        }}
                        title={`Check ${check.name} monitors position ${pos}`}
                      />
                    ) : (
                      <div
                        style={{
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          background: 'var(--border-subtle)',
                          opacity: 0.4
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ParityGroups;
