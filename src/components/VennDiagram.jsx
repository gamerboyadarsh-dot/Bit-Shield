import React from 'react';
import { motion } from 'framer-motion';
import { POSITIONS_META, PARITY_CHECKS } from '../lib/hamming.js';

export function VennDiagram({
  bits = [0, 0, 0, 0, 0, 0, 0],
  corruptedPositions = [],
  syndromeBits = [0, 0, 0], // [S1, S2, S4]
  onBitClick = null,
  size = 320
}) {
  // S1 = check 0, S2 = check 1, S4 = check 2
  const s1Fail = syndromeBits[0] === 1;
  const s2Fail = syndromeBits[1] === 1;
  const s4Fail = syndromeBits[2] === 1;

  // Geometry: 3 overlapping circles
  const positionsCoords = {
    1: { x: 160, y: 65, label: 'p₁', name: 'p1' },   // S1 only (top lobe)
    2: { x: 80,  y: 205, label: 'p₂', name: 'p2' },  // S2 only (left lobe)
    3: { x: 120, y: 130, label: 'd₃', name: 'd3' },  // S1 ∩ S2
    4: { x: 240, y: 205, label: 'p₄', name: 'p4' },  // S4 only (right lobe)
    5: { x: 200, y: 130, label: 'd₅', name: 'd5' },  // S1 ∩ S4
    6: { x: 160, y: 215, label: 'd₆', name: 'd6' },  // S2 ∩ S4
    7: { x: 160, y: 160, label: 'd₇', name: 'd7' }   // S1 ∩ S2 ∩ S4 (center)
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
      <svg
        width={size}
        height={size * 0.9}
        viewBox="0 0 320 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible', maxWidth: '100%' }}
      >
        <defs>
          <filter id="vennGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Circle 1: S1 (Top) */}
        <circle
          cx="160"
          cy="105"
          r="80"
          fill={s1Fail ? 'rgba(244, 63, 94, 0.16)' : 'rgba(34, 211, 238, 0.08)'}
          stroke={s1Fail ? 'var(--status-danger-border)' : 'var(--bit-parity-border)'}
          strokeWidth="2"
          strokeDasharray={s1Fail ? 'none' : '4 3'}
          style={{ transition: 'all 0.3s ease' }}
        />
        <text
          x="160"
          y="20"
          textAnchor="middle"
          fill={s1Fail ? 'var(--status-danger-text)' : 'var(--text-main)'}
          fontFamily="var(--font-sans)"
          fontWeight="750"
          fontSize="12.5"
          letterSpacing="-0.01em"
        >
          Check S₁ (r₁ ⊕ r₃ ⊕ r₅ ⊕ r₇) {s1Fail ? '✗ FAIL' : '✓ PASS'}
        </text>

        {/* Circle 2: S2 (Bottom-Left) */}
        <circle
          cx="115"
          cy="185"
          r="80"
          fill={s2Fail ? 'rgba(244, 63, 94, 0.16)' : 'rgba(99, 102, 241, 0.08)'}
          stroke={s2Fail ? 'var(--status-danger-border)' : 'var(--bit-data-border)'}
          strokeWidth="2"
          strokeDasharray={s2Fail ? 'none' : '4 3'}
          style={{ transition: 'all 0.3s ease' }}
        />
        <text
          x="40"
          y="270"
          textAnchor="start"
          fill={s2Fail ? 'var(--status-danger-text)' : 'var(--text-main)'}
          fontFamily="var(--font-sans)"
          fontWeight="750"
          fontSize="12.5"
        >
          S₂ {s2Fail ? '✗' : '✓'}
        </text>

        {/* Circle 3: S4 (Bottom-Right) */}
        <circle
          cx="205"
          cy="185"
          r="80"
          fill={s4Fail ? 'rgba(244, 63, 94, 0.16)' : 'rgba(251, 191, 36, 0.08)'}
          stroke={s4Fail ? 'var(--status-danger-border)' : 'var(--status-warning-border)'}
          strokeWidth="2"
          strokeDasharray={s4Fail ? 'none' : '4 3'}
          style={{ transition: 'all 0.3s ease' }}
        />
        <text
          x="280"
          y="270"
          textAnchor="end"
          fill={s4Fail ? 'var(--status-danger-text)' : 'var(--text-main)'}
          fontFamily="var(--font-sans)"
          fontWeight="750"
          fontSize="12.5"
        >
          S₄ {s4Fail ? '✗' : '✓'}
        </text>

        {/* 7 Position Interactive Nodes */}
        {Object.entries(positionsCoords).map(([posStr, coord]) => {
          const pos = Number(posStr);
          const bitVal = bits[pos - 1] !== undefined ? bits[pos - 1] : 0;
          const isCorrupt = corruptedPositions.includes(pos);
          const meta = POSITIONS_META[pos - 1];
          const isParity = meta.role === 'parity';

          return (
            <g
              key={pos}
              transform={`translate(${coord.x}, ${coord.y})`}
              style={{ cursor: onBitClick ? 'pointer' : 'default' }}
              onClick={onBitClick ? () => onBitClick(pos) : undefined}
            >
              <circle
                r="19"
                fill={
                  isCorrupt
                    ? 'var(--bit-corrupt-bg)'
                    : isParity
                    ? 'var(--bit-parity-bg)'
                    : 'var(--bit-data-bg)'
                }
                stroke={
                  isCorrupt
                    ? 'var(--bit-corrupt-border)'
                    : isParity
                    ? 'var(--bit-parity-border)'
                    : 'var(--bit-data-border)'
                }
                strokeWidth={isCorrupt ? '2.5' : '1.5'}
                filter={isCorrupt ? 'url(#vennGlow)' : 'none'}
              />
              <text
                textAnchor="middle"
                dy="-2"
                fill={
                  isCorrupt
                    ? 'var(--bit-corrupt-text)'
                    : isParity
                    ? 'var(--bit-parity-text)'
                    : 'var(--bit-data-text)'
                }
                fontFamily="var(--font-mono)"
                fontWeight="800"
                fontSize="14"
              >
                {bitVal}
              </text>
              <text
                textAnchor="middle"
                dy="12"
                fill="var(--text-subtle)"
                fontFamily="var(--font-mono)"
                fontWeight="700"
                fontSize="9"
              >
                {coord.label}
              </text>
            </g>
          );
        })}
      </svg>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', textAlign: 'center' }}>
        Geometric Venn Parity: Click any region to flip that bit. Failing check circles highlight in red.
      </span>
    </div>
  );
}

export default VennDiagram;
