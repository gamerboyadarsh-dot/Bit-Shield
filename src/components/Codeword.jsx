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
    sm: { height: '52px', fontSize: '1.25rem' },
    md: { height: '68px', fontSize: '1.65rem' },
    lg: { height: '80px', fontSize: '2rem' }
  }[size];

  return (
    <div
      className={`codeword-wrapper ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.85rem',
        width: '100%',
        ...style
      }}
    >
      <div
        className="codeword-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: size === 'sm' ? '0.35rem' : size === 'lg' ? '0.85rem' : '0.6rem',
          maxWidth: size === 'lg' ? '680px' : size === 'sm' ? '420px' : '560px',
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
          let glow = isParity ? 'var(--bit-parity-glow)' : 'var(--bit-data-glow)';
          let BadgeIcon = isParity ? Diamond : Square;

          if (isCorrupt) {
            bg = 'var(--bit-corrupt-bg)';
            border = 'var(--bit-corrupt-border)';
            text = 'var(--bit-corrupt-text)';
            glow = 'var(--bit-corrupt-glow)';
            BadgeIcon = AlertCircle;
          } else if (isCorrected) {
            bg = 'var(--bit-corrected-bg)';
            border = 'var(--bit-corrected-border)';
            text = 'var(--bit-corrected-text)';
            glow = 'var(--bit-corrected-glow)';
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
                gap: '0.35rem',
                position: 'relative'
              }}
              onMouseEnter={() => onBitHover && onBitHover(pos)}
              onMouseLeave={() => onBitHover && onBitHover(null)}
            >
              {/* Position Header Coordinate */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: isHighlighted ? 'var(--accent)' : 'var(--text-subtle)',
                  transition: 'color 0.2s ease'
                }}
              >
                <span>{pos}</span>
              </div>

              {/* Bit Chip Button / Display */}
              <motion.div
                whileHover={isInteractive ? { scale: 1.05, y: -2 } : {}}
                whileTap={isInteractive ? { scale: 0.94 } : {}}
                style={{ width: '100%' }}
                className="bit-chip-cell"
              >
                <CellElement
                  type={isInteractive ? 'button' : undefined}
                  onClick={isInteractive ? () => onBitClick(pos) : undefined}
                  aria-label={ariaLabel}
                  style={{
                    width: '100%',
                    height: cellSizes.height,
                    background: bg,
                    border: `1.5px solid ${isHighlighted ? 'var(--accent)' : border}`,
                    borderRadius: isParity ? 'var(--radius-lg)' : 'var(--radius-md)',
                    color: text,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: cellSizes.fontSize,
                    fontWeight: 800,
                    cursor: isInteractive ? 'pointer' : 'default',
                    boxShadow: isHighlighted ? `0 0 20px var(--accent-glow)` : glow,
                    backdropFilter: 'blur(10px)',
                    outline: 'none',
                    transition: 'border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Subtle inner top-edge highlight */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '1px',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
                    }}
                  />

                  {/* Bit Value with Flip Scale Entrance */}
                  <motion.span
                    key={`${pos}-${bitVal}-${isCorrupt}-${isCorrected}`}
                    initial={{ scale: 0.7, rotateX: 90, opacity: 0 }}
                    animate={{ scale: 1, rotateX: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                    className="tabular-nums"
                    style={{ lineHeight: 1 }}
                  >
                    {bitVal}
                  </motion.span>

                  {/* Corner indicator dot on error */}
                  {isCorrupt && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ repeat: Infinity, duration: 1.8 }}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--accent-rose)',
                        boxShadow: '0 0 8px var(--accent-rose)'
                      }}
                    />
                  )}
                </CellElement>
              </motion.div>

              {/* Role Label with Shape Cue */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 650,
                  color: isHighlighted ? 'var(--accent)' : 'var(--text-muted)'
                }}
              >
                <BadgeIcon size={10} strokeWidth={2.2} />
                <span>{meta.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Codeword;
