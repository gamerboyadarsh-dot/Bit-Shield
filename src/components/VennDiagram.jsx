import React from 'react';
import { motion } from 'framer-motion';
import { POSITIONS_META, PARITY_CHECKS } from '../lib/hamming.js';

export function VennDiagram({
  bits = [0, 0, 0, 0, 0, 0, 0],
  corruptedPositions = [],
  syndromeBits = [0, 0, 0], // [S1, S2, S4]
  onBitClick = null,
  size = 360
}) {
  const s1Fail = syndromeBits[0] === 1;
  const s2Fail = syndromeBits[1] === 1;
  const s4Fail = syndromeBits[2] === 1;

  // Geometry: 3 overlapping circles
  // Circle 1: S1 (top) - Cyan
  // Circle 2: S2 (bottom-left) - Violet
  // Circle 3: S4 (bottom-right) - Amber
  const positionsCoords = {
    1: { x: 180, y: 75,  label: 'p₁', name: 'p1' },   // S1 only (top lobe)
    2: { x: 95,  y: 225, label: 'p₂', name: 'p2' },  // S2 only (left lobe)
    3: { x: 135, y: 145, label: 'd₃', name: 'd3' },  // S1 ∩ S2
    4: { x: 265, y: 225, label: 'p₄', name: 'p4' },  // S4 only (right lobe)
    5: { x: 225, y: 145, label: 'd₅', name: 'd5' },  // S1 ∩ S4
    6: { x: 180, y: 240, label: 'd₆', name: 'd6' },  // S2 ∩ S4
    7: { x: 180, y: 175, label: 'd₇', name: 'd7' }   // S1 ∩ S2 ∩ S4 (center)
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-glass-input)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 0 35px -5px rgba(99, 102, 241, 0.25)'
        }}
      >
        <svg
          width={size}
          height={size * 0.9}
          viewBox="0 0 360 310"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible', maxWidth: '100%' }}
        >
          <defs>
            <filter id="vennShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.4" />
            </filter>
            <filter id="vennBitGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Circle 1: S1 (Top) - Cyan */}
          <circle
            cx="180"
            cy="120"
            r="92"
            fill={s1Fail ? 'rgba(244, 63, 94, 0.22)' : 'rgba(34, 211, 238, 0.14)'}
            stroke={s1Fail ? 'var(--status-danger-border)' : 'var(--accent-cyan)'}
            strokeWidth={s1Fail ? '2.5' : '1.8'}
            strokeDasharray={s1Fail ? 'none' : '4 3'}
            style={{ mixBlendMode: 'screen', transition: 'all 0.3s ease' }}
          />
          <text
            x="180"
            y="22"
            textAnchor="middle"
            fill={s1Fail ? 'var(--status-danger-text)' : 'var(--accent-cyan)'}
            fontFamily="var(--font-mono)"
            fontWeight="800"
            fontSize="12"
            letterSpacing="0.04em"
          >
            S₁ {s1Fail ? '✗ FAIL (1)' : '✓ PASS (0)'}
          </text>

          {/* Circle 2: S2 (Bottom-Left) - Violet */}
          <circle
            cx="130"
            cy="205"
            r="92"
            fill={s2Fail ? 'rgba(244, 63, 94, 0.22)' : 'rgba(139, 92, 246, 0.14)'}
            stroke={s2Fail ? 'var(--status-danger-border)' : 'var(--accent-secondary)'}
            strokeWidth={s2Fail ? '2.5' : '1.8'}
            strokeDasharray={s2Fail ? 'none' : '4 3'}
            style={{ mixBlendMode: 'screen', transition: 'all 0.3s ease' }}
          />
          <text
            x="35"
            y="300"
            textAnchor="start"
            fill={s2Fail ? 'var(--status-danger-text)' : 'var(--accent-secondary)'}
            fontFamily="var(--font-mono)"
            fontWeight="800"
            fontSize="12"
          >
            S₂ {s2Fail ? '✗ FAIL' : '✓ PASS'}
          </text>

          {/* Circle 3: S4 (Bottom-Right) - Amber */}
          <circle
            cx="230"
            cy="205"
            r="92"
            fill={s4Fail ? 'rgba(244, 63, 94, 0.22)' : 'rgba(251, 191, 36, 0.14)'}
            stroke={s4Fail ? 'var(--status-danger-border)' : 'var(--accent-amber)'}
            strokeWidth={s4Fail ? '2.5' : '1.8'}
            strokeDasharray={s4Fail ? 'none' : '4 3'}
            style={{ mixBlendMode: 'screen', transition: 'all 0.3s ease' }}
          />
          <text
            x="325"
            y="300"
            textAnchor="end"
            fill={s4Fail ? 'var(--status-danger-text)' : 'var(--accent-amber)'}
            fontFamily="var(--font-mono)"
            fontWeight="800"
            fontSize="12"
          >
            S₄ {s4Fail ? '✗ FAIL' : '✓ PASS'}
          </text>

          {/* 7 Interactive Bit Nodes with Glow & 3D Tactile Nodes */}
          {Object.entries(positionsCoords).map(([posStr, coord]) => {
            const pos = Number(posStr);
            const bitVal = bits[pos - 1] !== undefined ? bits[pos - 1] : 0;
            const isCorrupt = corruptedPositions.includes(pos);
            const meta = POSITIONS_META[pos - 1];
            const isParity = meta.role === 'parity';

            let nodeBg = isParity ? 'rgba(13, 148, 136, 0.65)' : 'rgba(30, 58, 138, 0.65)';
            let nodeBorder = isParity ? 'var(--bit-parity-border)' : 'var(--bit-data-border)';
            let nodeText = isParity ? 'var(--bit-parity-text)' : 'var(--bit-data-text)';

            if (isCorrupt) {
              nodeBg = 'rgba(225, 29, 72, 0.75)';
              nodeBorder = 'var(--bit-corrupt-border)';
              nodeText = 'var(--bit-corrupt-text)';
            }

            return (
              <g
                key={pos}
                transform={`translate(${coord.x}, ${coord.y})`}
                style={{ cursor: onBitClick ? 'pointer' : 'default' }}
                onClick={onBitClick ? () => onBitClick(pos) : undefined}
              >
                <circle
                  r="21"
                  fill={nodeBg}
                  stroke={nodeBorder}
                  strokeWidth={isCorrupt ? '3' : '1.8'}
                  filter={isCorrupt ? 'url(#vennBitGlow)' : 'url(#vennShadow)'}
                  style={{ backdropFilter: 'blur(8px)', transition: 'all 0.2s' }}
                />
                <text
                  textAnchor="middle"
                  dy="-2"
                  fill={nodeText}
                  fontFamily="var(--font-mono)"
                  fontWeight="850"
                  fontSize="15"
                >
                  {bitVal}
                </text>
                <text
                  textAnchor="middle"
                  dy="13"
                  fill="var(--text-subtle)"
                  fontFamily="var(--font-mono)"
                  fontWeight="750"
                  fontSize="9.5"
                >
                  {coord.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
        Geometric 3-Circle Venn Partition: Click any region to flip that bit and trigger parity violation rings.
      </span>
    </div>
  );
}

export default VennDiagram;
