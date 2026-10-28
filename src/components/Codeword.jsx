import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Check, Square, Diamond } from 'lucide-react';
import { POSITIONS_META } from '../lib/hamming.js';

export function Codeword({
  bits = [0, 0, 0, 0, 0, 0, 0],
  corruptedPositions = [], // 1-indexed array of corrupted positions, e.g. [6]
  correctedPositions = [], // 1-indexed array of corrected positions, e.g. [6]
  highlightedPositions = [], // 1-indexed array from check hovering
  onBitClick = null,       // (position: number) => void
  onBitHover = null,       // (position: number | null) => void
  size = 'md',             // 'sm' | 'md' | 'lg'
  className = '',
  style = {}
}) {
  const isInteractive = typeof onBitClick === 'function';

  const cellSizes = {
    sm: { width: '42px', height: '48px', fontSize: '1.25rem', padding: '0.25rem' },
    md: { width: '56px', height: '64px', fontSize: '1.625rem', padding: '0.375rem' },
    lg: { width: '68px', height: '76px', fontSize: '2rem', padding: '0.5rem' }
  }[size];

  return (
    <div
      className={`codeword-wrapper ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        width: '100%',
        ...style
      }}
    >
      <div
        className="codeword-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: size === 'sm' ? '0.375rem' : '0.625rem',
          maxWidth: size === 'lg' ? '600px' : size === 'sm' ? '380px' : '480px',
          width: '100%'
        }}
        role="group"
        aria-label="Hamming 7-bit codeword"
      >
        {POSITIONS_META.map((meta, index) => {
          const pos = meta.pos;
          const bitVal = bits[index] !== undefined ? bits[index] : 0;
          const isCorrupt = corruptedPositions.includes(pos);
          const isCorrected = correctedPositions.includes(pos);
          const isHighlighted = highlightedPositions.includes(pos);
          const isParity = meta.role === 'parity';

          // Determine visual styling token
          let bg = isParity ? 'var(--bit-parity-bg)' : 'var(--bit-data-bg)';
          let border = isParity ? 'var(--bit-parity-border)' : 'var(--bit-data-border)';
          let text = isParity ? 'var(--bit-parity-text)' : 'var(--bit-data-text)';
          let badgeText = isParity ? 'Parity' : 'Data';
          let BadgeIcon = isParity ? Diamond : Square;

          if (isCorrupt) {
            bg = 'var(--bit-corrupt-bg)';
            border = 'var(--bit-corrupt-border)';
            text = 'var(--bit-corrupt-text)';
            badgeText = 'Corrupt';
            BadgeIcon = AlertCircle;
          } else if (isCorrected) {
            bg = 'var(--bit-corrected-bg)';
            border = 'var(--bit-corrected-border)';
            text = 'var(--bit-corrected-text)';
            badgeText = 'Corrected';
            BadgeIcon = Check;
          }

          const ariaLabel = `Position ${pos}, ${meta.role} bit ${meta.name}, value ${bitVal}${
            isCorrupt ? ', corrupted' : isCorrected ? ', corrected' : ''
          }${isInteractive ? ', click to flip' : ''}`;

          const CellElement = isInteractive ? 'button' : 'div';

          return (
            <div
              key={pos}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem'
              }}
              onMouseEnter={() => onBitHover && onBitHover(pos)}
              onMouseLeave={() => onBitHover && onBitHover(null)}
            >
              {/* Position Header */}
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: isHighlighted ? 'var(--accent)' : 'var(--text-subtle)',
                  transition: 'color 0.15s ease'
                }}
              >
                {pos}
              </span>

              {/* Bit Cell */}
              <motion.div
                whileHover={isInteractive ? { scale: 1.04 } : {}}
                whileTap={isInteractive ? { scale: 0.96 } : {}}
                style={{ width: '100%' }}
              >
                <CellElement
                  type={isInteractive ? 'button' : undefined}
                  onClick={isInteractive ? () => onBitClick(pos) : undefined}
                  aria-label={ariaLabel}
                  style={{
                    width: '100%',
                    height: cellSizes.height,
                    background: bg,
                    border: `2px solid ${isHighlighted ? 'var(--accent)' : border}`,
                    borderRadius: isParity ? 'var(--radius-lg)' : 'var(--radius-md)',
                    color: text,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: cellSizes.fontSize,
                    fontWeight: 700,
                    cursor: isInteractive ? 'pointer' : 'default',
                    boxShadow: isHighlighted ? '0 0 0 2px var(--accent-light)' : 'var(--shadow-sm)',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease',
                    position: 'relative'
                  }}
                >
                  <motion.span
                    key={`${pos}-${bitVal}`}
                    initial={{ scale: 0.85, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    className="tabular-nums"
                  >
                    {bitVal}
                  </motion.span>
                </CellElement>
              </motion.div>

              {/* Role Label with Shape Icon */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: isHighlighted ? 'var(--accent)' : 'var(--text-muted)'
                }}
              >
                <BadgeIcon size={10} strokeWidth={2} />
                <span>{meta.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
