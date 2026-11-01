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
  const checkColors = {
    S1: { color: 'var(--accent-cyan)', label: 'P₁', bg: 'rgba(34, 211, 238, 0.15)', glow: '0 0 12px rgba(34, 211, 238, 0.5)' },
    S2: { color: 'var(--accent-secondary)', label: 'P₂', bg: 'rgba(139, 92, 246, 0.15)', glow: '0 0 12px rgba(139, 92, 246, 0.5)' },
    S4: { color: 'var(--accent-amber)', label: 'P₄', bg: 'rgba(251, 191, 36, 0.15)', glow: '0 0 12px rgba(251, 191, 36, 0.5)' }
  };

  return (
    <div
      className={`parity-matrix-container ${className}`}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.65rem',
        ...style
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          maxWidth: size === 'lg' ? '680px' : size === 'sm' ? '420px' : '560px',
          width: '100%',
          background: 'var(--bg-glass-input)',
          padding: '0.85rem 1.15rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}
        role="table"
        aria-label="Hamming Parity Coverage Matrix"
      >
        {/* Header with Column Numbers 1..7 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '48px repeat(7, minmax(0, 1fr))',
            gap: size === 'sm' ? '0.35rem' : size === 'lg' ? '0.85rem' : '0.6rem',
            alignItems: 'center',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 750,
            color: 'var(--text-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '0.35rem'
          }}
        >
          <span style={{ textAlign: 'left', paddingLeft: '0.25rem' }}>CHECK</span>
          {POSITIONS_META.map((meta) => (
            <span
              key={meta.pos}
              style={{
                textAlign: 'center',
                color: hoveredPosition === meta.pos ? 'var(--accent-cyan)' : 'var(--text-subtle)',
                transition: 'color 0.2s'
              }}
            >
              {meta.pos}
            </span>
          ))}
        </div>

        {/* 3 Parity Rows: P1, P2, P4 */}
        {PARITY_CHECKS.map((check) => {
          const isCheckActive = activeCheck === check.id;
          const conf = checkColors[check.id] || { color: 'var(--accent)', label: check.name, glow: 'none' };
          const coversHovered = hoveredPosition !== null && check.positions.includes(hoveredPosition);

          return (
            <div
              key={check.id}
              role="row"
              style={{
                display: 'grid',
                gridTemplateColumns: '48px repeat(7, minmax(0, 1fr))',
                gap: size === 'sm' ? '0.35rem' : size === 'lg' ? '0.85rem' : '0.6rem',
                alignItems: 'center',
                padding: '0.4rem 0.25rem',
                borderRadius: 'var(--radius-sm)',
                background: isCheckActive || coversHovered ? 'var(--accent-light)' : 'transparent',
                border: isCheckActive ? `1px solid ${conf.color}` : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={() => onCheckHover && onCheckHover(check.id)}
              onMouseLeave={() => onCheckHover && onCheckHover(null)}
            >
              {/* Row Label (P1, P2, P4) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: conf.color
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: conf.color,
                    boxShadow: conf.glow
                  }}
                />
                <span>{conf.label}</span>
              </div>

              {/* 7 Cell Dots */}
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
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '24px'
                    }}
                  >
                    {isCovered ? (
                      <motion.div
                        animate={{
                          scale: isCellHovered || isCheckActive ? 1.35 : 1
                        }}
                        style={{
                          width: '13px',
                          height: '13px',
                          borderRadius: '50%',
                          background: conf.color,
                          boxShadow: isCellHovered || isCheckActive ? conf.glow : 'none',
                          opacity: 1,
                          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s'
                        }}
                        title={`Check ${check.name} covers position ${pos}`}
                      />
                    ) : (
                      <div
                        style={{
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          background: 'var(--border-card)',
                          opacity: 0.35
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

      <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
        Hover parity row to isolate covered subset · Hover bit coordinate to inspect checking rows
      </span>
    </div>
  );
}

export default ParityGroups;
